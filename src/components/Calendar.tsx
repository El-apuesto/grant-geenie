import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { GrantDeadline, CalendarDay, DeadlineStats } from '../types/calendar';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, XCircle, Award } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [deadlines, setDeadlines] = useState<GrantDeadline[]>([]);
  const [selectedDay, setSelectedDay] = useState<GrantDeadline[] | null>(null);
  const [stats, setStats] = useState<DeadlineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'submitted' | 'awarded' | 'declined' | 'missed'>('all');

  // Load deadlines from grants
  useEffect(() => {
    if (!user) return;

    const loadDeadlines = async () => {
      try {
        // Get all active grants
        const { data: grants, error: grantsError } = await supabase
          .from('grants')
          .select('id, title, funder_name, deadline, is_rolling')
          .eq('is_active', true)
          .not('deadline', 'is', null)
          .order('deadline', { ascending: true });

        if (grantsError) throw grantsError;

        // Check if user has grant_deadlines table entries
        const { data: savedDeadlines, error: deadlinesError } = await supabase
          .from('grant_deadlines')
          .select('*')
          .eq('user_id', user.id)
          .order('deadline', { ascending: true });

        if (deadlinesError && deadlinesError.code !== 'PGRST116') throw deadlinesError;

        // Combine: use saved deadlines if they exist, otherwise create from grants
        let allDeadlines: GrantDeadline[] = [];

        if (savedDeadlines && savedDeadlines.length > 0) {
          allDeadlines = savedDeadlines as GrantDeadline[];
        } else if (grants && grants.length > 0) {
          // Create deadline entries from saved grants
          const { data: savedGrants } = await supabase
            .from('saved_grants')
            .select('grant_id')
            .eq('user_id', user.id);

          const savedGrantIds = new Set(savedGrants?.map(g => g.grant_id) || []);

          allDeadlines = grants
            .filter(g => savedGrantIds.has(g.id))
            .map(g => ({
              id: `${user.id}-${g.id}`,
              user_id: user.id,
              grant_id: g.id,
              grant_title: g.title,
              funder_name: g.funder_name,
              deadline: g.deadline || '',
              is_rolling: g.is_rolling,
              status: 'upcoming' as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
        }

        setDeadlines(allDeadlines);
        calculateStats(allDeadlines);
      } catch (err) {
        console.error('Error loading deadlines:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDeadlines();
  }, [user]);

  const calculateStats = (deadlineList: GrantDeadline[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = deadlineList.filter(
      d => new Date(d.deadline) > today && d.status === 'upcoming'
    );

    const nextDeadline = upcoming.length > 0 ? upcoming[0] : null;
    const daysUntilNext = nextDeadline
      ? Math.ceil((new Date(nextDeadline.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    setStats({
      total: deadlineList.length,
      upcoming: deadlineList.filter(d => d.status === 'upcoming').length,
      submitted: deadlineList.filter(d => d.status === 'submitted').length,
      awarded: deadlineList.filter(d => d.status === 'awarded').length,
      declined: deadlineList.filter(d => d.status === 'declined').length,
      missed: deadlineList.filter(d => d.status === 'missed').length,
      daysUntilNext,
      nextDeadlineDate: nextDeadline?.deadline || null,
    });
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = firstDay.getDay() - 1; i >= 0; i--) {
      const date = new Date(prevLastDay);
      date.setDate(prevLastDay.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        deadlines: getDeadlinesForDate(dateStr),
        count: getDeadlinesForDate(dateStr).length,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().split('T')[0],
        deadlines: getDeadlinesForDate(dateStr),
        count: getDeadlinesForDate(dateStr).length,
      });
    }

    // Next month days
    for (let i = 1; days.length < 42; i++) {
      const date = new Date(year, month + 1, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        day: i,
        month: (month + 1) % 12,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        deadlines: getDeadlinesForDate(dateStr),
        count: getDeadlinesForDate(dateStr).length,
      });
    }

    return days;
  };

  const getDeadlinesForDate = (dateStr: string): GrantDeadline[] => {
    return deadlines.filter(d => {
      if (filter === 'all') return d.deadline === dateStr;
      return d.deadline === dateStr && d.status === filter;
    });
  };

  const calendarDays = getCalendarDays();
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-600/20 border-blue-500/30 text-blue-400';
      case 'submitted':
        return 'bg-purple-600/20 border-purple-500/30 text-purple-400';
      case 'awarded':
        return 'bg-green-600/20 border-green-500/30 text-green-400';
      case 'declined':
        return 'bg-red-600/20 border-red-500/30 text-red-400';
      case 'missed':
        return 'bg-orange-600/20 border-orange-500/30 text-orange-400';
      default:
        return 'bg-slate-600/20 border-slate-500/30 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircle className="w-4 h-4" />;
      case 'awarded':
        return <Award className="w-4 h-4" />;
      case 'declined':
        return <XCircle className="w-4 h-4" />;
      case 'missed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-xs">Total Deadlines</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{stats.upcoming}</div>
              <div className="text-slate-400 text-xs">Upcoming</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{stats.submitted}</div>
              <div className="text-slate-400 text-xs">Submitted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{stats.awarded}</div>
              <div className="text-slate-400 text-xs">Awarded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">{stats.declined}</div>
              <div className="text-slate-400 text-xs">Declined</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">{stats.missed}</div>
              <div className="text-slate-400 text-xs">Missed</div>
            </div>
          </div>

          {stats.nextDeadlineDate && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                Next deadline in <span className="text-emerald-400 font-bold">{stats.daysUntilNext} days</span> on{' '}
                <span className="text-emerald-400 font-bold">
                  {new Date(stats.nextDeadlineDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'upcoming', 'submitted', 'awarded', 'declined', 'missed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              filter === f
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900/50 border-b border-slate-700 p-4 flex justify-between items-center">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-slate-700 rounded transition"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-slate-700 rounded transition"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-slate-700">
          {WEEKDAYS.map(day => (
            <div key={day} className="p-3 text-center text-slate-400 text-sm font-semibold border-r border-slate-700 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="divide-y divide-slate-700">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-0">
              {week.map((day, dayIndex) => (
                <div
                  key={day.date}
                  className={`min-h-24 p-2 border-r border-slate-700 last:border-r-0 cursor-pointer hover:bg-slate-700/50 transition ${
                    !day.isCurrentMonth ? 'bg-slate-900/30' : 'bg-transparent'
                  } ${
                    day.isToday ? 'border-l-4 border-l-emerald-500' : ''
                  }`}
                  onClick={() => setSelectedDay(day.deadlines)}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    day.isCurrentMonth ? 'text-white' : 'text-slate-500'
                  }`}>
                    {day.day}
                  </div>
                  {day.count > 0 && (
                    <div className="space-y-1">
                      {day.deadlines.slice(0, 2).map(deadline => (
                        <div
                          key={deadline.id}
                          className={`text-xs px-2 py-1 rounded border truncate flex items-center gap-1 ${getStatusColor(
                            deadline.status
                          )}`}
                        >
                          {getStatusIcon(deadline.status)}
                          <span className="truncate">{deadline.funder_name}</span>
                        </div>
                      ))}
                      {day.count > 2 && (
                        <div className="text-xs text-slate-400 px-2">+{day.count - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && selectedDay.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Deadlines for this day</h3>
          <div className="space-y-3">
            {selectedDay.map(deadline => (
              <div key={deadline.id} className={`p-4 rounded-lg border ${getStatusColor(deadline.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {getStatusIcon(deadline.status)}
                      {deadline.grant_title}
                    </div>
                    <div className="text-sm mt-1 opacity-80">{deadline.funder_name}</div>
                    {deadline.notes && (
                      <div className="text-sm mt-2 opacity-90">Note: {deadline.notes}</div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-black/30 rounded">
                    {deadline.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deadlines.length === 0 && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 text-lg mb-2">No tracked deadlines yet</p>
          <p className="text-slate-400">Save grants to track their deadlines on your calendar.</p>
        </div>
      )}
    </div>
  );
}
