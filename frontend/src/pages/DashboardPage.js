import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useProjects } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/ProjectModal';
import { format } from 'date-fns';


const PRIORITY_DOT = { low: '#34d399', medium: '#fbbf24', high: '#fb7b24', critical: '#f87171' };

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const navigate = useNavigate();

  const handleSave = async (data) => {
    try {
      if (editProject) {
        await updateProject(editProject._id, data);
        toast.success('Project updated!');
      } else {
        await createProject(data);
        toast.success('Project created!');
      }
      setShowModal(false);
      setEditProject(null);
    } catch {
      toast.error('Failed to save project');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleEdit = (e, project) => {
    e.stopPropagation();
    setEditProject(project);
    setShowModal(true);
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length ? Math.round(projects.reduce((a, p) => a + (p.progress || 0), 0) / projects.length) : 0,
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={styles.subtitle}>Here's what's happening with your projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowModal(true); }}>
          + New Project
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total Projects', value: stats.total, icon: '📁', color: 'var(--accent)' },
          { label: 'Active', value: stats.active, icon: '🔥', color: 'var(--green)' },
          { label: 'Completed', value: stats.completed, icon: '✅', color: '#a855f7' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, icon: '📈', color: 'var(--yellow)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Your Projects</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <span className="spinner" />
          </div>
        ) : projects.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ marginBottom: '8px' }}>No projects yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Create your first project to get started</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Project</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map(project => (
              <div key={project._id} className="card" style={styles.projectCard} onClick={() => navigate(`/projects/${project._id}`)}>
                <div style={styles.projectHeader}>
                  <div style={{ ...styles.colorDot, background: project.color || 'var(--accent)' }} />
                  <div style={styles.projectBadges}>
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIORITY_DOT[project.priority], display: 'inline-block' }} title={project.priority} />
                  </div>
                </div>
                <h3 style={styles.projectName}>{project.name}</h3>
                <p style={styles.projectDesc}>{project.description || 'No description'}</p>
                <div style={{ marginTop: '16px' }}>
                  <div className="flex justify-between" style={{ marginBottom: '6px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ fontWeight: '600' }}>{project.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                  </div>
                </div>
                {project.deadline && (
                  <div style={styles.deadline}>
                    📅 {format(new Date(project.deadline), 'MMM d, yyyy')}
                  </div>
                )}
                <div style={styles.projectFooter}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <button className="btn-icon" onClick={e => handleEdit(e, project)} title="Edit">✏️</button>
                    <button className="btn-icon" onClick={e => handleDelete(e, project._id)} title="Delete">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProjectModal
          project={editProject}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditProject(null); }}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = {
  page: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '800', marginBottom: '6px' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '15px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' },
  statCard: { textAlign: 'center', padding: '24px' },
  statIcon: { fontSize: '28px', marginBottom: '12px' },
  statValue: { fontSize: '32px', fontWeight: '800', marginBottom: '4px' },
  statLabel: { fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' },
  section: {},
  sectionTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  projectCard: { cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', ':hover': {} },
  projectHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  colorDot: { width: '12px', height: '12px', borderRadius: '50%' },
  projectBadges: { display: 'flex', alignItems: 'center', gap: '8px' },
  projectName: { fontSize: '17px', fontWeight: '700', marginBottom: '6px', lineHeight: '1.3' },
  projectDesc: { fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  deadline: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' },
  projectFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' },
  empty: { textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: '16px' },
};
