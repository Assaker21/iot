#define TEMP_PIN 19
#define CURR_PIN 34
#define VOLT_PIN 35
#define RED_PIN 4
#define GREEN_PIN 2
#define BLUE_PIN 5
#define BTN_PIN 18
#define RLY_PIN 23

const char *apSSID = "IOT Device";
const char *apPassword = "password";

const float voltmeter_sensitivity = 646.0f;

#include <jsonlib.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiAP.h>
#include <EEPROM.h>
#include <ArduinoMqttClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ACS712.h>
#include <ZMPT101B.h>

struct SensorData {
  float temperature;
  float current;
  float voltage;
};

enum State {
  CONNECTING,
  NORMAL,
  SETUP
};

enum LedColors {
  RED,
  GREEN,
  BLUE
};

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);
ACS712 ACS(CURR_PIN, 3.3, 4095, 100);
ZMPT101B voltageSensor(VOLT_PIN, 50.0);

State state = CONNECTING;
WiFiServer server(80);
WiFiClient wifiClient;
MqttClient mqttClient(wifiClient);

const char broker[] = "test.mosquitto.org";
int port = 1883;
String topic = "iot_system/A4CF12148738";
String mac;

double timer;
double timerInterval = 500;
bool buttonState;
bool relayState;

SensorData sensorData;

void setup() {
  Serial.begin(115200);

  EEPROM.begin(512);

  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(BTN_PIN, INPUT_PULLUP);
  pinMode(RLY_PIN, OUTPUT);

  sensors.begin();
  voltageSensor.setSensitivity(voltmeter_sensitivity);
  ACS.autoMidPoint();

  digitalWrite(RLY_PIN, HIGH);
  relayState = 1;

  updateState(CONNECTING);
}

void loop() {
  bool timerFired = checkTimer(), buttonPress = buttonPressed();

  if (buttonPress) {
    if (state == CONNECTING || state == NORMAL) {
      updateState(SETUP);
    } else {
      updateState(CONNECTING);
    }
  }

  switch (state) {
    case CONNECTING:
      if (WiFi.status() == WL_CONNECTED) {
        updateState(NORMAL);
      }

      break;
    case NORMAL:
      {
        mqttClient.poll();
        int messageSize = mqttClient.parseMessage();
        if (messageSize) {
          char letter1 = (char)mqttClient.read();
          char letter2 = (char)mqttClient.read();

          if (letter1 == 'O' && letter2 == 'n') {
            digitalWrite(RLY_PIN, HIGH);
            relayState = 1;

          } else if (letter1 == 'O' && letter2 == 'f') {
            digitalWrite(RLY_PIN, LOW);
            relayState = 0;
          }
        }

        
        if (timerFired) {
          getSensorData();
          sendSensorData();
        }
        break;
      }
    case SETUP:
      if (WiFi.getMode() & WIFI_AP) {
        APMode();
      }
      break;
  }
}

void updateState(State newState) {
  switch (newState) {
    case CONNECTING:
      updateLed(BLUE);
      connectToWiFi();
      break;

    case NORMAL:
      updateLed(GREEN);

      mac = WiFi.macAddress();
      //macAddress.replace(":", "");

      topic = "iot_system/";
      topic += mac;

      Serial.println("TOPIC: ");
      Serial.print(topic);

      mqttClient.subscribe(topic);
      break;

    case SETUP:
      updateLed(RED);
      startAccessPoint();
      break;
  }

  state = newState;
}

void connectToWiFi() {
  WiFi.softAPdisconnect(true);

  String ssid, password;
  ssid = readStringFromEEPROM(0);
  password = readStringFromEEPROM(200);

  Serial.print("Connecting to ");
  Serial.print(ssid);
  Serial.print(", ");
  Serial.println(password);


  WiFi.begin(ssid.c_str(), password.c_str());

  int count = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    count++;
    if (count > 30) {
      updateState(SETUP);
      return;
    }
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  if (!mqttClient.connect(broker, port)) {
    Serial.print("MQTT connection failed! Error code = ");
    Serial.println(mqttClient.connectError());

    while (1)
      ;
  }

  Serial.println("You're connected to the MQTT broker!");
  Serial.println();

  updateState(NORMAL);
}

void APMode() {
  WiFiClient client = server.available();  // listen for incoming clients

  if (client) {  // if you get a client
    Serial.println("New Client.");
    String currentLine = "";         // make a String to hold incoming data from the client
    String postData = "";            // make a String to hold POST data
    bool currentLineIsBlank = true;  // used to detect end of headers
    bool isPost = false;             // flag to check if the request is POST

    while (client.connected()) {  // loop while the client's connected
      if (client.available()) {   // if there's bytes to read from the client
        char c = client.read();   // read a byte
        Serial.write(c);          // print it out the serial monitor

        if (c == '\n' && currentLineIsBlank) {  // end of headers
          if (isPost) {
            // Read the POST data from the client
            while (client.available()) {
              postData += (char)client.read();
            }

            String newSSID = jsonExtract(postData, "ssid");
            String newPassword = jsonExtract(postData, "password");

            Serial.println("New SSID: " + newSSID);
            Serial.println("New Password: " + newPassword);

            writeStringToEEPROM(0, newSSID);
            writeStringToEEPROM(200, newPassword);

            EEPROM.commit();

            // Switch to client mode
            updateState(CONNECTING);  //connectToWiFi();


          } else {
            mac = WiFi.macAddress();
            // Send form HTML
            client.println("HTTP/1.1 200 OK");
            client.println("Content-type:text/html");
            client.println("X-MAC-Address: " + mac);
            client.println();
            client.println();
            client.println("<!DOCTYPE HTML><html><body>");

            client.println("<form action=\"/submit\" method=\"POST\">");
            client.println("SSID: <input type=\"text\" name=\"ssid\"><br>");
            client.println("Password: <input type=\"password\" name=\"password\"><br>");
            client.println("<input type=\"submit\" value=\"Submit\">");
            client.println("</form>");
            client.println("</body></html>");
            client.println();
          }
          break;
        }

        if (c == '\n') {
          currentLineIsBlank = true;
          if (currentLine.startsWith("POST /submit")) {
            isPost = true;
          }
          currentLine = "";
        } else if (c != '\r') {
          currentLineIsBlank = false;
          currentLine += c;
        }
      }
    }
    client.stop();
    Serial.println("Client Disconnected.");
  }
}

void startAccessPoint() {
  WiFi.disconnect(true);
  Serial.println("Configuring access point...");

  if (!WiFi.softAP(apSSID, apPassword)) {
    Serial.println("Soft AP creation failed.");
    while (1)
      ;
  }

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);
  server.begin();
  Serial.println("Server started");
}

void getSensorData() {
  sensors.requestTemperatures();
  sensorData.temperature = sensors.getTempCByIndex(0);

  float average = 0;
  for (int i = 0; i < 100; i++) {
    average += ACS.mA_AC();
  }
  float mA = average / 100.0;
  sensorData.current = average / 100.0;

  sensorData.voltage = voltageSensor.getRmsVoltage();
}

void sendSensorData() {
  Serial.print("SENDING DATA TO TOPIC: ");
  Serial.println(topic);

  mqttClient.beginMessage(topic);
  mqttClient.print("{\"t\":");
  mqttClient.print(sensorData.temperature);
  mqttClient.print(",\"c\":");
  mqttClient.print(sensorData.current);
  mqttClient.print(",\"v\":");
  mqttClient.print(sensorData.voltage);
  mqttClient.print(",\"s\":");
  mqttClient.print(relayState);
  mqttClient.print("}");
  mqttClient.endMessage();
}

void writeStringToEEPROM(int address, const String &str) {
  for (int i = 0; i < str.length(); ++i) {
    EEPROM.write(address + i, str[i]);
  }
  EEPROM.write(address + str.length(), '\0');  // Add null terminator
  EEPROM.commit();
}

String readStringFromEEPROM(int address) {
  String result;
  char ch = EEPROM.read(address);
  while (ch != '\0') {
    result += ch;
    address++;
    ch = EEPROM.read(address);
  }
  return result;
}

void updateLed(LedColors color) {
  digitalWrite(RED_PIN, color == RED);
  digitalWrite(GREEN_PIN, color == GREEN);
  digitalWrite(BLUE_PIN, color == BLUE);
}

void resetTimer() {
  timer = millis();
}

bool checkTimer() {
  if (millis() - timer > timerInterval) {
    timer = millis();
    return true;
  }
  return false;
}

bool buttonPressed() {
  bool currentButtonState = digitalRead(BTN_PIN);
  bool answer = buttonState == LOW && currentButtonState == HIGH;
  buttonState = currentButtonState;
  return answer;
}