import React from "react";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import DashboardLayout from "./layouts/dashboard.layout";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { AuthContextProvider } from "./contexts/auth.context";

export default () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <ApplicationProvider {...eva} theme={eva.light}>
      <AuthContextProvider>
        <DashboardLayout />
      </AuthContextProvider>
    </ApplicationProvider>
  </>
);
