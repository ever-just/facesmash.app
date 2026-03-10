import { FaceAPIProvider } from "@/contexts/FaceAPIContext";
import GlobalLoadingScreen from "@/components/GlobalLoadingScreen";
import { ReactNode } from "react";

/**
 * Wraps face-dependent routes (Login, Register) with the FaceAPIProvider.
 * This defers TensorFlow.js / face-api model loading (~12MB) to only the
 * routes that actually need face recognition, instead of loading on every page.
 */
const FaceRouteWrapper = ({ children }: { children: ReactNode }) => (
  <FaceAPIProvider>
    <GlobalLoadingScreen />
    {children}
  </FaceAPIProvider>
);

export default FaceRouteWrapper;
