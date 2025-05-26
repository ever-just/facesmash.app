
interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold mb-4 text-white">
        FACECARD: {userName}
      </h1>
      <p className="text-gray-300 text-lg">
        You have successfully authenticated using facial recognition
      </p>
    </div>
  );
};

export default WelcomeSection;
