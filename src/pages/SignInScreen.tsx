import { AuthButton } from "@coinbase/cdp-react/components/AuthButton";

/**
 * The Sign In screen
 */
function SignInScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="text-muted-foreground">Welcome!</p>
          <p className="text-muted-foreground">Please sign in to continue.</p>
        </div>
        
        <div className="pt-4">
          <AuthButton className="w-full bg-primary hover:bg-primary-glow text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors" />
        </div>
      </div>
    </div>
  );
}

export default SignInScreen;
