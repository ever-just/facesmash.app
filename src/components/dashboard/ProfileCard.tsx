import { Check } from "lucide-react";

interface ProfileCardProps {
  userName: string;
  userProfile: any;
}

const ProfileCard = ({ userName, userProfile }: ProfileCardProps) => {
  const rows = [
    { label: "Name", value: userName.split('@')[0] },
    { label: "Email", value: userName },
    { label: "Face profile", value: "Registered", accent: true },
    ...(userProfile ? [{ label: "Created", value: new Date(userProfile.created_at).toLocaleDateString() }] : []),
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] mb-5">Profile</p>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-white/30 text-sm">{row.label}</span>
            {row.accent ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm">
                <Check className="size-3.5" /> {row.value}
              </span>
            ) : (
              <span className="text-white/70 text-sm truncate ml-4 max-w-[200px]">{row.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileCard;
