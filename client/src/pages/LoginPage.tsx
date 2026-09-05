import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to manage your events and RSVPs"
    >
      <LoginForm />
    </AuthLayout>
  );
};
export default LoginPage;
