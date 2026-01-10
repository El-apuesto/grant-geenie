import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, FileText, CheckCircle, AlertTriangle, TrendingUp, BookOpen, Zap, Save, Download, Plus, Edit2 } from 'lucide-react';

interface Project {
  id: string;
  project_title: string;
  grant_type: string;
  status: string;
  funding_amount: number;
  deadline: string;
}

interface Section {
  id: string;
  section_type: string;
  title: string;
  content: string;
  word_count: number;
  character_limit?: number;
  ai_suggestions?: any;
}

export default function EnterpriseGrantWriter() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    project_title: '',
    grant_type: 'federal',
    funding_amount: '',
    deadline: '',
  });

  useEffect(() => {
    loadProjects();
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      loadSections(selectedProject.id);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_writing_projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('grant_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectData.project_title) return;

    try {
      const { data, error } = await supabase
        .from('grant_writing_projects')
        .insert([{
          user_id: user?.id,
          project_title: newProjectData.project_title,
          grant_type: newProjectData.grant_type,
          funding_amount: parseInt(newProjectData.funding_amount) * 100, // Convert to cents
          deadline: newProjectData.deadline || null,
          status: 'draft',
        }])
        .select()
        .single();

      if (error) throw error;
      
      setProjects([data, ...projects]);
      setSelectedProject(data);
      setShowNewProject(false);
      setNewProjectData({ project_title: '', grant_type: 'federal', funding_amount: '', deadline: '' });
      
      // Auto-create standard sections
      createStandardSections(data.id);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const createStandardSections = async (projectId: string) => {
    const standardSections = [
      { section_type: 'executive_summary', title: 'Executive Summary' },
      { section_type: 'needs_statement', title: 'Statement of Need' },
      { section_type: 'goals_objectives', title: 'Goals & Objectives' },
      { section_type: 'methods', title: 'Methods & Activities' },
      { section_type: 'evaluation', title: 'Evaluation Plan' },
      { section_type: 'budget', title: 'Budget Narrative' },
      { section_type: 'sustainability', title: 'Sustainability Plan' },
    ];

    for (const section of standardSections) {
      await supabase.from('grant_sections').insert([{
        project_id: projectId,
        section_type: section.section_type,
        title: section.title,
        content: '',
        word_count: 0,
      }]);
    }

    loadSections(projectId);
  };

  const callAIAssistant = async (action: string, prompt?: string) => {
    if (!selectedSection && action !== 'generate_section') return;

    setAiLoading(true);
    try {
      const response = await supabase.functions.invoke('grant-ai-assistant', {
        body: {
          action,
          projectId: selectedProject?.id,
          sectionId: selectedSection?.id,
          grantType: selectedProject?.grant_type,
          prompt: prompt || selectedSection?.title,
          content: selectedSection?.content,
        },
      });

      if (response.error) throw response.error;

      // Update section with AI response
      if (selectedSection) {
        const updatedContent = action === 'improve_content' 
          ? response.data.response 
          : selectedSection.content;

        await supabase
          .from('grant_sections')
          .update({
            content: updatedContent,
            ai_suggestions: { response: response.data.response, action, timestamp: new Date().toISOString() },
            word_count: updatedContent.split(/\s+/).length,
          })
          .eq('id', selectedSection.id);

        loadSections(selectedProject!.id);
      }

      alert('AI Assistant complete! Check the suggestions.');
    } catch (error) {
      console.error('AI Assistant error:', error);
      alert('Error: ' + (error as any).message);
    } finally {
      setAiLoading(false);
    }
  };

  const updateSectionContent = async (content: string) => {
    if (!selectedSection) return;

    await supabase
      .from('grant_sections')
      .update({
        content,
        word_count: content.split(/\s+/).filter(w => w).length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedSection.id);
  };

  if (loading) {
    return <div className="text-white">Loading Enterprise Grant Writer...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Enterprise Grant Writer</h1>
            <p className="text-slate-400 text-sm">Professional AI-powered grant writing with TPS compliance</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Create Grant Project</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2">Project Title *</label>
                <input
                  type="text"
                  value={newProjectData.project_title}
                  onChange={(e) => setNewProjectData({ ...newProjectData, project_title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., NEA Art Works 2026"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Grant Type *</label>
                <select
                  value={newProjectData.grant_type}
                  onChange={(e) => setNewProjectData({ ...newProjectData, grant_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="federal">Federal</option>
                  <option value="state">State</option>
                  <option value="foundation">Foundation</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Funding Amount ($)</label>
                <input
                  type="number"
                  value={newProjectData.funding_amount}
                  onChange={(e) => setNewProjectData({ ...newProjectData, funding_amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="50000"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2">Deadline</label>
                <input
                  type="date"
                  value={newProjectData.deadline}
                  onChange={(e) => setNewProjectData({ ...newProjectData, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={createProject}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                >
                  Create Project
                </button>
                <button
                  onClick={() => setShowNewProject(false)}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-white font-semibold">Your Projects</h3>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm">No projects yet. Create one to get started!</p>
          ) : (
            projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedProject?.id === project.id
                    ? 'bg-purple-900/20 border-purple-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-white font-medium text-sm">{project.project_title}</div>
                <div className="text-slate-400 text-xs mt-1">
                  {project.grant_type} • ${(project.funding_amount / 100).toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 mt-1">{project.status}</div>
              </button>
            ))
          )}
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          {!selectedProject ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a project or create a new one to start writing</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sections */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm transition ${
                        selectedSection?.id === section.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              {selectedSection && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{selectedSection.title}</h3>
                    <div className="text-sm text-slate-400">
                      {selectedSection.word_count} words
                      {selectedSection.character_limit && ` / ${selectedSection.character_limit} chars`}
                    </div>
                  </div>

                  {/* AI Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => callAIAssistant('generate_section')}
                      disabled={aiLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                    >
                      <Zap className="w-4 h-4" />
                      Generate Content
                    </button>
                    <button
                      onClick={() => callAIAssistant('improve_content')}
                      disabled={aiLoading || !selectedSection.content}
                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Improve Quality
                    </button>
                    <button
                      onClick={() => callAIAssistant('compliance_check')}
                      disabled={aiLoading || !selectedSection.content}
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      TPS Compliance
                    </button>
                    <button
                      onClick={() => callAIAssistant('suggest_improvements')}
                      disabled={aiLoading || !selectedSection.content}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Strategic Tips
                    </button>
                  </div>

                  {/* Content Editor */}
                  <textarea
                    value={selectedSection.content}
                    onChange={(e) => {
                      setSelectedSection({ ...selectedSection, content: e.target.value });
                      updateSectionContent(e.target.value);
                    }}
                    placeholder="Start writing or use AI to generate content..."
                    className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white resize-none focus:outline-none focus:border-purple-500"
                  />

                  {/* AI Suggestions Panel */}
                  {selectedSection.ai_suggestions && (
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 font-semibold text-sm">AI Suggestions</span>
                      </div>
                      <div className="text-slate-300 text-sm whitespace-pre-wrap">
                        {selectedSection.ai_suggestions.response}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}