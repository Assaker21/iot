import { Layout, Spinner } from "@ui-kitten/components";

export default function LoadingLayout({ children, loading, ...props }) {
  return (
    <Layout
      {...props}
      style={
        loading
          ? {
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }
          : props.style || {}
      }
    >
      {loading ? <Spinner /> : children}
    </Layout>
  );
}
