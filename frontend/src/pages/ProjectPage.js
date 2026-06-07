import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTasks } from '../hooks/useApi';
import TaskModal from '../components/TaskModal';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'todo', label: '📋 To Do', color: 'var(--text-muted)' },
  { id: 'in-progress', label: '⚡ In Progress', color: 'var(--blue)' },
  { id: 'review', label: '🔍 Review', color: 'var(--yellow)' },
  { id: 'done', label: '✅ Done', color: 'var(--green)' },
];

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(id);
  const [project, setProject] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');

  React.useEffect(() => {
    axios.get(`/api/projects/${id}`)
      .then(res => setProject(res.data))
      .catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  const handleSaveTask = async (data) => {
    try {
      if (editTask) {
        await updateTask(editTask._id, data);
        toast.success('Task updated!');
      } else {
        await createTask(data);
        toast.success('Task created!');
      }
      setShowTaskModal(false);
      setEditTask(null);
    } catch {
      toast.error('Failed to save task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const openNewTask = (status) => {
    setDefaultStatus(status);
    setEditTask(null);
    setShowTaskModal(true);
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>← Back</button>
        {project && (
          <div style={styles.projectInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: project.color || 'var(--accent)' }} />
              <h1 style={styles.title}>{project.name}</h1>
              <span className={`badge badge-${project.status}`}>{project.status}</span>
            </div>
            {project.description && <p style={styles.desc}>{project.description}</p>}
            <div style={styles.projectMeta}>
              <div style={styles.progressBlock}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{progress}% complete</span>
                <div className="progress-bar" style={{ width: '200px' }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
              {project.deadline && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  📅 Due {format(new Date(project.deadline), 'MMM d, yyyy')}
                </span>
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {totalTasks} tasks · {doneTasks} done
              </span>
            </div>
          </div>
        )}
        <button className="btn btn-primary" onClick={() => openNewTask('todo')}>+ Add Task</button>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}><span className="spinner" /></div>
      ) : (
        <div style={styles.board}>
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} style={styles.column}>
                <div style={styles.colHeader}>
                  <div style={styles.colTitle}>
                    <span>{col.label}</span>
                    <span style={{ ...styles.colCount, background: col.color + '22', color: col.color }}>{colTasks.length}</span>
                  </div>
                  <button className="btn-icon" style={{ fontSize: '16px', padding: '4px 8px' }} onClick={() => openNewTask(col.id)} title="Add task">+</button>
                </div>
                <div style={styles.colBody}>
                  {colTasks.length === 0 && (
                    <div style={styles.emptyCol} onClick={() => openNewTask(col.id)}>
                      <span>+ Add task</span>
                    </div>
                  )}
                  {colTasks.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onEdit={() => { setEditTask(task); setShowTaskModal(true); }}
                      onDelete={() => handleDeleteTask(task._id)}
                      onStatusChange={handleStatusChange}
                      columns={COLUMNS}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editTask}
          defaultStatus={defaultStatus}
          onSave={handleSaveTask}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onStatusChange, columns }) {
  const priorityColors = { low: 'var(--green)', medium: 'var(--yellow)', high: '#fb7b24', critical: 'var(--red)' };

  return (
    <div style={styles.taskCard} onClick={onEdit}>
      <div style={styles.taskHeader}>
        <div style={{ width: '4px', height: '36px', borderRadius: '2px', background: priorityColors[task.priority], flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h4 style={styles.taskTitle}>{task.title}</h4>
          {task.description && <p style={styles.taskDesc}>{task.description}</p>}
        </div>
      </div>
      <div style={styles.taskMeta}>
        {task.deadline && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            📅 {format(new Date(task.deadline), 'MMM d')}
          </span>
        )}
        {task.assignedTo && (
          <span style={styles.assignee} title={task.assignedTo.name}>
            {task.assignedTo.name?.[0]?.toUpperCase()}
          </span>
        )}
        <span className={`badge badge-${task.priority}`} style={{ fontSize: '10px', padding: '2px 7px' }}>{task.priority}</span>
      </div>
      <div style={styles.taskFooter}>
        <select
          value={task.status}
          onChange={e => { e.stopPropagation(); onStatusChange(task._id, e.target.value); }}
          onClick={e => e.stopPropagation()}
          style={styles.statusSelect}
        >
          {columns.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-icon" style={{ fontSize: '12px' }} onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete">🗑️</button>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  backBtn: { padding: '8px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap', fontWeight: '500' },
  projectInfo: { flex: 1 },
  title: { fontSize: '24px', fontWeight: '800' },
  desc: { color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' },
  projectMeta: { display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px', flexWrap: 'wrap' },
  progressBlock: { display: 'flex', alignItems: 'center', gap: '10px' },
  board: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', overflowX: 'auto', minWidth: 0 },
  column: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', minWidth: '240px' },
  colHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' },
  colTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px' },
  colCount: { padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' },
  colBody: { display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '120px' },
  emptyCol: { border: '2px dashed var(--border)', borderRadius: '10px', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' },
  taskCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s', display: 'flex', flexDirection: 'column', gap: '10px' },
  taskHeader: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  taskTitle: { fontSize: '14px', fontWeight: '600', lineHeight: '1.4', marginBottom: '3px' },
  taskDesc: { fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  taskMeta: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  assignee: { width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--accent)' },
  taskFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' },
  statusSelect: { fontSize: '11px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-secondary)', padding: '3px 6px', fontFamily: 'inherit', cursor: 'pointer' },
};
