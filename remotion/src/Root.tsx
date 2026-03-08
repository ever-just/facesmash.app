import { Composition } from "remotion";
import { FaceSmashPromo } from "./FaceSmashPromo";

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
    </>
  );
};
