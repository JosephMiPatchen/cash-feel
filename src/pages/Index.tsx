import { WalletDashboard } from "@/components/wallet/WalletDashboard";
import { useIsInitialized, useIsSignedIn } from "@coinbase/cdp-hooks";
import Loading from "./Loading";
import SignInScreen from "./SignInScreen";

const Index = () => {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();

  return (
    <div className="app flex-col-container flex-grow">
      {!isInitialized && <Loading />}
      {isInitialized && (
        <>
          {!isSignedIn && <SignInScreen />}
          {isSignedIn &&  <WalletDashboard />}
        </>
      )}
    </div>
  );
}
  
export default Index;
