import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import MajorityWarningModal from '../components/MajorityWarningModal';
import SendTeamOnBreak from '../components/SendTeamOnBreak';
import SpecialPermissions from '../components/SpecialPermissions';
import TimerAlerts from '../components/TimerAlerts';
import ActivityLog from '../components/ActivityLog';

// Mock the API calls
jest.mock('../utils/api', () => ({
  bulkUpdateTeam: jest.fn().mockResolvedValue({ success: true, updated: 3 }),
  updateStudent: jest.fn().mockResolvedValue({ success: true }),
  addLog: jest.fn().mockResolvedValue({ success: true }),
  addSpecialPermission: jest.fn().mockResolvedValue({ success: true }),
}));

describe('SpecialPermissions Component', () => {
  test('renders empty state message when there are no active overrides', () => {
    render(<SpecialPermissions specialPermissions={[]} />);
    expect(screen.getByText('NO ACTIVE OVERRIDES')).toBeInTheDocument();
  });

  test('renders active special permissions list', () => {
    const mockPerms = [
      { team: 'Alpha', authorizer: 'Dr. Smith', timestamp: '28/08/2026, 18:00:00' },
      { team: 'Beta', authorizer: 'Prof. Jones', timestamp: '28/08/2026, 18:10:00' },
    ];
    render(<SpecialPermissions specialPermissions={mockPerms} />);
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
    expect(screen.getByText('Prof. Jones')).toBeInTheDocument();
    expect(screen.getAllByText(/Authorized by/i)).toHaveLength(2);
    expect(screen.getByText('2')).toBeInTheDocument(); // count badge
  });
});

describe('MajorityWarningModal Component', () => {
  const mockStudent = { id: '1111111111', name: 'John Doe', team: 'Delta' };
  const mockAuthorizers = ['Alice', 'Bob', 'Charlie'];

  test('renders warning information correctly', () => {
    render(
      <MajorityWarningModal
        student={mockStudent}
        teamName="Delta"
        insideCount={2}
        totalCount={3}
        halfRequired={2}
        authorizers={mockAuthorizers}
        onPermit={jest.fn()}
        onDeny={jest.fn()}
      />
    );
    expect(screen.getByText('Majority-Out Warning')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Team Delta')).toBeInTheDocument();
    expect(screen.getByText(/Rule: At least/i)).toBeInTheDocument();
    expect(screen.getByText(/members must remain inside/i)).toBeInTheDocument();
  });

  test('calls onDeny when Deny button is clicked', () => {
    const handleDeny = jest.fn();
    render(
      <MajorityWarningModal
        student={mockStudent}
        teamName="Delta"
        insideCount={2}
        totalCount={3}
        halfRequired={2}
        authorizers={mockAuthorizers}
        onPermit={jest.fn()}
        onDeny={handleDeny}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /deny/i }));
    expect(handleDeny).toHaveBeenCalledTimes(1);
  });

  test('switches to auth step when Permit is clicked', () => {
    render(
      <MajorityWarningModal
        student={mockStudent}
        teamName="Delta"
        insideCount={2}
        totalCount={3}
        halfRequired={2}
        authorizers={mockAuthorizers}
        onPermit={jest.fn()}
        onDeny={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /permit/i }));
    expect(screen.getByText('Authorizer Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter authorizer name...')).toBeInTheDocument();
  });

  test('submits successfully when correct authorizer name is entered (case-insensitive)', () => {
    const handlePermit = jest.fn();
    render(
      <MajorityWarningModal
        student={mockStudent}
        teamName="Delta"
        insideCount={2}
        totalCount={3}
        halfRequired={2}
        authorizers={mockAuthorizers}
        onPermit={handlePermit}
        onDeny={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /permit/i }));
    
    const input = screen.getByPlaceholderText('Enter authorizer name...');
    fireEvent.change(input, { target: { value: 'bOb' } });
    fireEvent.click(screen.getByRole('button', { name: /authorize/i }));

    expect(handlePermit).toHaveBeenCalledWith('bOb');
  });

  test('shows error and calls onDeny after delay when invalid authorizer is entered', async () => {
    jest.useFakeTimers();
    const handleDeny = jest.fn();
    const handlePermit = jest.fn();
    render(
      <MajorityWarningModal
        student={mockStudent}
        teamName="Delta"
        insideCount={2}
        totalCount={3}
        halfRequired={2}
        authorizers={mockAuthorizers}
        onPermit={handlePermit}
        onDeny={handleDeny}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /permit/i }));
    
    const input = screen.getByPlaceholderText('Enter authorizer name...');
    fireEvent.change(input, { target: { value: 'Zachary' } });
    fireEvent.click(screen.getByRole('button', { name: /authorize/i }));

    expect(screen.getByText(/Name not recognized. Request denied./)).toBeInTheDocument();
    
    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(1850);
    });

    expect(handleDeny).toHaveBeenCalledTimes(1);
    expect(handlePermit).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('SendTeamOnBreak Component', () => {
  const mockStudents = [
    { id: '1', name: 'S1', team: 'A', status: 'inside' },
    { id: '2', name: 'S2', team: 'B', status: 'inside' },
  ];

  test('renders options properly', () => {
    render(<SendTeamOnBreak students={mockStudents} onBreakStart={jest.fn()} onRefresh={jest.fn()} />);
    expect(screen.getByText('Select team…')).toBeInTheDocument();
    expect(screen.getByText('🌟 ALL TEAMS (Entire Lobby)')).toBeInTheDocument();
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.getByText('Team B')).toBeInTheDocument();
  });

  test('requires confirmation on click', async () => {
    const { bulkUpdateTeam } = require('../utils/api');
    bulkUpdateTeam.mockClear();

    render(<SendTeamOnBreak students={mockStudents} onBreakStart={jest.fn()} onRefresh={jest.fn()} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'A' } });

    const btn = screen.getByRole('button', { name: /break/i });
    fireEvent.click(btn);

    // Should prompt for confirmation
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument();
    expect(bulkUpdateTeam).not.toHaveBeenCalled();
  });

  test('triggers break API and callbacks on confirmation', async () => {
    jest.useFakeTimers();
    const { bulkUpdateTeam } = require('../utils/api');
    bulkUpdateTeam.mockClear();

    const handleBreakStart = jest.fn();
    const handleRefresh = jest.fn();

    render(
      <SendTeamOnBreak
        students={mockStudents}
        onBreakStart={handleBreakStart}
        onRefresh={handleRefresh}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: /break/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(bulkUpdateTeam).toHaveBeenCalledWith({ team: 'A', status: 'outside' });
    
    await waitFor(() => {
      expect(handleBreakStart).toHaveBeenCalledWith('A');
    });

    // Fast-forward refresh timeout
    act(() => {
      jest.advanceTimersByTime(2050);
    });
    expect(handleRefresh).toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe('TimerAlerts & AlertBanner Logic', () => {
  test('calculates overdue students and excludes those on break', () => {
    // 16 minutes ago
    const exitTimeOverdue = (Date.now() - 16 * 60 * 1000).toString();
    // 5 minutes ago
    const exitTimeRecent = (Date.now() - 5 * 60 * 1000).toString();

    const mockStudents = [
      { id: '1', name: 'Alice Overdue', team: 'A', status: 'outside', exitTime: exitTimeOverdue },
      { id: '2', name: 'Bob Recent', team: 'A', status: 'outside', exitTime: exitTimeRecent },
      { id: '3', name: 'Charlie Break', team: 'B', status: 'outside', exitTime: exitTimeOverdue },
      { id: '4', name: 'David Inside', team: 'B', status: 'inside', exitTime: '' }
    ];

    const teamsOnBreak = new Set(['B']); // Team B is on break

    render(<TimerAlerts students={mockStudents} teamsOnBreak={teamsOnBreak} />);
    
    // Alice should show up because she is outside >15 min and Team A is NOT on break
    expect(screen.getByText('Alice Overdue')).toBeInTheDocument();
    
    // Bob should not show up because he is only outside 5 mins
    expect(screen.queryByText('Bob Recent')).toBeNull();

    // Charlie should not show up because Team B is on break
    expect(screen.queryByText('Charlie Break')).toBeNull();
  });
});

describe('ActivityLog Component UI Improvements', () => {
  test('renders student names fallback and badges correctly', () => {
    const mockLogs = [
      { studentId: '1111111111', studentName: 'Alice Smith', team: 'A', actionType: 'out', timestamp: Date.now().toString() },
      { studentId: '2222222222', studentName: 'Unknown Student', team: '', actionType: 'in', timestamp: Date.now().toString() }
    ];

    const mockStudents = [
      { id: '2222222222', name: 'Bob Jones', team: 'B', status: 'inside' }
    ];

    render(<ActivityLog logs={mockLogs} students={mockStudents} />);

    // Direct student name rendering
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument(); // Team Badge

    // Fallback: Name should resolve from students list for Bob Jones since directName was 'Unknown Student'
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument(); // Team Badge
  });
});
