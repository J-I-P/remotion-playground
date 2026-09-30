import { Composition } from "remotion";
import { JYPinBoot, TOTAL_FRAMES, FPS } from "./JYPinBoot/JYPinBoot";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="JYPinBoot"
      component={JYPinBoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
