import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Application } from '../types';
import { Plus, Calendar, DollarSign, FileText, X, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLUMNS = [
  { id: 'Draft', label: 'Draft', color: 'slate' },
  { id: 'In Progress', label: 'In Progress', color: 'blue' },
  { id: 'Submitted', label: 'Submitted', color: 'purple' },
  { id: 'Under Review', label: 'Under Review', color: 'yellow' },
  { id: 'Awarded', label: 'Awarded', color: 'emerald' },
  { id: 'Declined', label: 'Declined', color: 'red' },
];

interface ApplicationTrackerProps {
  isPro: boolean;
}

export default function ApplicationTracker({ isPro }: ApplicationTrackerProps) {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    grant_title: '',
    funder_name: '',
    application_type: 'LOI' as Application['application_type'],
    status: 'Draft' as Application['status'],
    due_date: '',
    submitted_date: '',
    decision_date: '',
    amount_requested: '',
    amount_awarded: '',
    notes: '',
  });

  useEffect(() => {
    if (user) loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const appData = {
        user_id: user.id,
        grant_title: formData.grant_title,
        funder_name: formData.funder_name,
        application_type: formData.application_type,
        status: formData.status,
        due_date: formData.due_date || null,
        submitted_date: formData.submitted_date || null,
        decision_date: formData.decision_date || null,
        amount_requested: formData.amount_requested ? parseFloat(formData.amount_requested) : null,
        amount_awarded: formData.amount_awarded ? parseFloat(formData.amount_awarded) : null,
        notes: formData.notes || null,
      };

      if (editingApp) {
        const { error } = await supabase
          .from('applications')
          .update(appData)
          .eq('id', editingApp.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([appData]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingApp(null);
      resetForm();
      loadApplications();
    } catch (err) {
      console.error('Error saving application:', err);
      setError('Failed to save application');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application');
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setFormData({
      grant_title: app.grant_title,
      funder_name: app.funder_name,
      application_type: app.application_type,
      status: app.status,
      due_date: app.due_date || '',
      submitted_date: app.submitted_date || '',
      decision_date: app.decision_date || '',
      amount_requested: app.amount_requested?.toString() || '',
      amount_awarded: app.amount_awarded?.toString() || '',
      notes: app.notes || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      grant_title: '',
      funder_name: '',
      application_type: 'LOI',
      status: 'Draft',
      due_date: '',
      submitted_date: '',
      decision_date: '',
      amount_requested: '',
      amount_awarded: '',
      notes: '',
    });
  };

  const getStatusColor = (status: Application['status']) => {
    const column = STATUS_COLUMNS.find(c => c.id === status);
    return column?.color || 'slate';
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stats = {
    total: applications.length,
    submitted: applications.filter(a => ['Submitted', 'Under Review', 'Awarded', 'Declined'].includes(a.status)).length,
    awarded: applications.filter(a => a.status === 'Awarded').length,
    totalRequested: applications.reduce((sum, a) => sum + (a.amount_requested || 0), 0),
    totalAwarded: applications.reduce((sum, a) => sum + (a.amount_awarded || 0), 0),
  };

  if (!isPro) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Application Tracking - Pro Feature</h3>
        <p className="text-slate-400">Upgrade to Pro to track your grant applications</p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-slate-400">Total Applications</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{stats.submitted}</div>
          <div className="text-sm text-slate-400">Submitted</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{stats.awarded}</div>
          <div className="text-sm text-slate-400">Awarded</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalRequested)}</div>
          <div className="text-sm text-slate-400">Requested</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.totalAwarded)}</div>
          <div className="text-sm text-slate-400">Awarded</div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Application Pipeline</h3>
        <button
          onClick={() => {
            setEditingApp(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_COLUMNS.map(column => {
          const columnApps = applications.filter(a => a.status === column.id);
          return (
            <div key={column.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-semibold text-${column.color}-400`}>
                  {column.label}
                </h4>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                  {columnApps.length}
                </span>
              </div>
              <div className="space-y-2">
                {columnApps.map(app => (
                  <div
                    key={app.id}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-emerald-500/30 transition cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="text-sm font-semibold text-white line-clamp-2 flex-1">
                        {app.grant_title}
                      </h5>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(app)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1 hover:bg-slate-700 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{app.funder_name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {app.amount_requested && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {formatCurrency(app.amount_requested)}
                        </span>
                      )}
                      {app.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(app.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border-2 border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingApp(null);
                  resetForm();
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Grant Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Grant Title *</label>
                <input
                  type="text"
                  required
                  value={formData.grant_title}
                  onChange={(e) => setFormData({ ...formData, grant_title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Funder Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Funder Name *</label>
                <input
                  type="text"
                  required
                  value={formData.funder_name}
                  onChange={(e) => setFormData({ ...formData, funder_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                  <select
                    value={formData.application_type}
                    onChange={(e) => setFormData({ ...formData, application_type: e.target.value as Application['application_type'] })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOI">LOI</option>
                    <option value="Letter of Intent">Letter of Intent</option>
                    <option value="Full Application">Full Application</option>
                    <option value="Proposal">Proposal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {STATUS_COLUMNS.map(col => (
                      <option key={col.id} value={col.id}>{col.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Submitted Date</label>
                  <input
                    type="date"
                    value={formData.submitted_date}
                    onChange={(e) => setFormData({ ...formData, submitted_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Decision Date</label>
                  <input
                    type="date"
                    value={formData.decision_date}
                    onChange={(e) => setFormData({ ...formData, decision_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount Requested</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.amount_requested}
                    onChange={(e) => setFormData({ ...formData, amount_requested: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount Awarded</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.amount_awarded}
                    onChange={(e) => setFormData({ ...formData, amount_awarded: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this application..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingApp(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-semibold"
                >
                  {editingApp ? 'Update' : 'Add'} Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
