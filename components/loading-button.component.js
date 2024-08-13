import { Button, Spinner } from "@ui-kitten/components";

export default function LoadingButton({ children, loading, ...props }) {
  return (
    <Button
      accessoryLeft={(props) => {
        if (loading) {
          return <Spinner size="small" />;
        } else return;
      }}
      disabled={loading}
      {...props}
    >
      {loading ? "" : children}
    </Button>
  );
}
