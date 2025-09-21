import ResetPasswordPage from "./components/ResetPasswordPage";

const ResetPassword = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const token = (await params).token;
  return (
    <>
      <ResetPasswordPage token={token} />
    </>
  );
};

export default ResetPassword;
