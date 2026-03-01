interface WelcomeSectionProps {
  userName: string;
}

const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
  const displayName = userName.split('@')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mb-12">
      <p className="text-white/20 uppercase tracking-[0.2em] text-xs mb-3">{greeting}</p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        {displayName}
      </h1>
      <p className="text-white/30 mt-2 text-sm">{userName}</p>
    </div>
  );
};

export default WelcomeSection;
