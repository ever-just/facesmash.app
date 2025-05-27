
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { getSignInLogsByUser } from "@/services/signInLogService";

interface ActivityGraphProps {
  userEmail: string;
  userCreatedAt?: string;
}

const ActivityGraph = ({ userEmail, userCreatedAt }: ActivityGraphProps) => {
  const [activityData, setActivityData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      const logs = await getSignInLogsByUser(userEmail);
      const activity: Record<string, number> = {};
      
      logs.forEach(log => {
        const date = new Date(log.sign_in_time).toISOString().split('T')[0];
        activity[date] = (activity[date] || 0) + 1;
      });
      
      setActivityData(activity);
      setLoading(false);
    };

    if (userEmail) {
      fetchActivityData();
    }
  }, [userEmail]);

  const generateActivityGrid = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28); // Last 4 weeks (28 days)
    
    const weeks = [];
    const currentDate = new Date(startDate);

    // Start from Sunday of the week containing start date
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    while (currentDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityData[dateStr] || 0;
        
        week.push({
          date: new Date(currentDate),
          count,
          intensity: count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-800';
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-300';
      default: return 'bg-gray-800';
    }
  };

  const weeks = generateActivityGrid();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Get month labels for the 4-week period
  const getMonthLabels = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    const endDate = new Date();
    
    const months = new Set();
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      months.add(currentDate.toLocaleString('default', { month: 'short' }));
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return Array.from(months);
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="text-center py-8">
          <Activity className="h-8 w-8 text-white mx-auto mb-4 animate-spin" />
          <p className="text-white">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center text-lg sm:text-xl">
          <Activity className="mr-2 h-5 w-5" />
          Login Activity
        </CardTitle>
        <CardDescription className="text-gray-400">
          Your login activity over the last 4 weeks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[300px] sm:min-w-0">
            {/* Month labels */}
            <div className="flex mb-2 text-xs text-gray-400 justify-center">
              {getMonthLabels().map((month, index) => (
                <span key={index} className="mx-2">
                  {month}
                </span>
              ))}
            </div>

            {/* Activity grid */}
            <div className="flex justify-center">
              {/* Day labels */}
              <div className="flex flex-col pr-2">
                {days.map((day, index) => (
                  <div key={day} className="h-3 mb-1 text-xs text-gray-400 text-right w-4">
                    {index % 2 === 1 && day}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} 
                          hover:ring-2 hover:ring-white hover:ring-opacity-50 cursor-pointer transition-all`}
                        title={`${day.date.toLocaleDateString()}: ${day.count} login${day.count !== 1 ? 's' : ''}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(intensity => (
                  <div
                    key={intensity}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityGraph;
