import React, { Suspense } from "react";
import AuthCallback from "./components/AuthCallback";

const CallbackPage = () => {
  return (
    <div>
      <Suspense>
        <AuthCallback />
      </Suspense>
    </div>
  );
};

export default CallbackPage;
