import { Composition } from "remotion";
import { FaceSmashPromo } from "./FaceSmashPromo";
import { LandingPromo } from "./LandingPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="FaceSmashPromo"
        component={FaceSmashPromo}
        durationInFrames={670}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LandingPromo"
        component={LandingPromo}
        durationInFrames={1060}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
