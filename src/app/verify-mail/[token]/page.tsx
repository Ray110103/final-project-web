"use client";

import { FC, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import useVerifyEmail from "../_hooks/useVerifyEmail";

// Remove custom props interface since page components can't accept custom props
const VerifyMail: FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const { mutate: verifyEmail, isSuccess, isError, error } = useVerifyEmail();
  
  // Get token from URL search params
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      setIsVerifying(true);
      verifyEmail(token, {
        onSettled: () => {
          setIsVerifying(false);
        },
      });
    } else {
      setIsVerifying(false);
    }
  }, [token, verifyEmail]);

  // Handle case when no token is provided
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-medium text-red-600">
            Invalid verification link.
          </p>
          <p className="text-sm text-gray-500">
            No verification token found in the URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 flex items-center justify-center">
      {isVerifying && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-medium text-blue-600">Verifying...</p>
        </div>
      )}

      {!isVerifying && isSuccess && (
        <div className="text-center">
          <p className="text-xl font-medium text-green-600">
            Email verified successfully!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can now close this window and proceed to login.
          </p>
        </div>
      )}

      {!isVerifying && isError && (
        <div className="text-center">
          <p className="text-xl font-medium text-red-600">
            Verification failed.
          </p>
          <p className="text-sm text-gray-500">
            {(error as Error)?.message || "Something went wrong."}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyMail;