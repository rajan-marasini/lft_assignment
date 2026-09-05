import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EventPulse today to start hosting and organizing amazing events"
    >
      <RegisterForm />
    </AuthLayout>
  );
};
export default RegisterPage;
