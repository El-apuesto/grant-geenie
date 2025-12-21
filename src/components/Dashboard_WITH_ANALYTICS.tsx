import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Grant, Profile, Application } from '../types';
import { getStateName } from '../lib/states';
import { ExternalLink, LogOut, Lamp, Settings as SettingsIcon, Crown, Lock, Search, Plus, Calendar, DollarSign, Building2, FileText, Bookmark, Filter, X, ClipboardList, BarChart3 } from 'lucide-react';
import ProductTour from './ProductTour';
import HelpButton from './HelpButton';
import Settings from './Settings';
import Questionnaire from './Questionnaire';
import LOIGenerator from './LOIGenerator';
import FiscalSponsorsPage from './FiscalSponsorsPage';
import ApplicationWizard from './ApplicationWizard';
import CalendarPage from './CalendarPage';
import ApplicationTracker from './ApplicationTracker';
import AnalyticsDashboard from './AnalyticsDashboard';
import { useTour } from '../hooks/useTour';

// Note: This file appears to be unused. The active Dashboard.tsx is used instead.
// Keeping for reference but marking as deprecated.

interface ProfileWithQuestionnaire extends Profile {
  primary_fields?: string[];
}

export default function Dashboard() {
  // This component is not actively used
  return null;
}