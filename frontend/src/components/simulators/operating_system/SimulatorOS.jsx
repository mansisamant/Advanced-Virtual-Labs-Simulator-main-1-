import React, { useState, useEffect } from 'react';
import { Clock, Plus, Play, Pause, SkipForward, RefreshCw, Table } from 'lucide-react';
import ExperimentData from './components/ExperimentData';

const ProcessSchedulerSimulator = () => {
  const [processes, setProcesses] = useState([]);
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [showMetrics, setShowMetrics] = useState(false);
  
  // Process Form State
  const [newProcess, setNewProcess] = useState({
    id: 1,
    name: 'P1',
    arrivalTime: 0,
    burstTime: 5,
    priority: 1,
    remainingTime: 5,
    color: generateRandomColor()
  });
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentTime(0);
    setExecutionHistory([]);
    setCompletedProcesses([]);
    setProcesses(processes.map(p => ({
      ...p,
      remainingTime: p.burstTime,
      completed: false,
      startTime: null,
      endTime: null
    })));
  };
  
  // Run simulation step
  const runStep = () => {
    if (allProcessesCompleted()) {
      setIsRunning(false);
      setShowMetrics(true);
      return;
    }
    
    let nextProcess = null;
    const availableProcesses = processes.filter(
      p => p.arrivalTime <= currentTime && p.remainingTime > 0
    );
    
    switch(algorithm) {
      case 'fcfs':
        nextProcess = availableProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
        break;
      case 'sjf':
        nextProcess = availableProcesses.sort((a, b) => a.remainingTime - b.remainingTime)[0];
        break;
      case 'priority':
        nextProcess = availableProcesses.sort((a, b) => a.priority - b.priority)[0];
        break;
      case 'rr':
        // Round-robin logic here
        const lastExecuted = executionHistory[executionHistory.length - 1];
        const processQueue = availableProcesses.sort((a, b) => {
          // If a process was just executed, it goes to the end of the queue
          if (lastExecuted && a.id === lastExecuted.id) return 1;
          if (lastExecuted && b.id === lastExecuted.id) return -1;
          return a.arrivalTime - b.arrivalTime;
        });
        nextProcess = processQueue[0];
        break;
    }
    
    if (nextProcess) {
      // Update execution history
      setExecutionHistory(prev => [...prev, {
        id: nextProcess.id,
        name: nextProcess.name,
        time: currentTime,
        color: nextProcess.color
      }]);
      
      // Update process remaining time
      setProcesses(processes.map(p => {
        if (p.id === nextProcess.id) {
          const timeToExecute = algorithm === 'rr' 
            ? Math.min(timeQuantum, p.remainingTime)
            : 1;
            
          const newRemainingTime = p.remainingTime - timeToExecute;
          const completed = newRemainingTime <= 0;
          
          // If process is completed, add to completed processes
          if (completed && !completedProcesses.find(cp => cp.id === p.id)) {
            setCompletedProcesses(prev => [...prev, {
              ...p,
              endTime: currentTime + timeToExecute,
              turnaroundTime: (currentTime + timeToExecute) - p.arrivalTime,
              waitingTime: (currentTime + timeToExecute) - p.arrivalTime - p.burstTime
            }]);
          }
          
          // Set start time if this is the first time the process runs
          const startTime = p.startTime === null ? currentTime : p.startTime;
          
          return {
            ...p,
            remainingTime: newRemainingTime,
            completed,
            startTime,
            endTime: completed ? currentTime + timeToExecute : null
          };
        }
        return p;
      }));
      
      // Update current time
      const timeIncrement = algorithm === 'rr' 
        ? Math.min(timeQuantum, nextProcess.remainingTime)
        : 1;
      setCurrentTime(prev => prev + timeIncrement);
    } else {
      // No process available, just increment time
      setCurrentTime(prev => prev + 1);
    }
  };
  
  // Check if all processes are completed
  const allProcessesCompleted = () => {
    return processes.length > 0 && processes.every(p => p.remainingTime <= 0);
  };
  
  // Start/stop simulation
  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };
  
  // Add a new process
  const addProcess = () => {
    setProcesses([...processes, newProcess]);
    setNewProcess({
      id: newProcess.id + 1,
      name: `P${newProcess.id + 1}`,
      arrivalTime: 0,
      burstTime: 5,
      priority: 1,
      remainingTime: 5,
      color: generateRandomColor()
    });
  };
  
  // Generate random color for process
  function generateRandomColor() {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Run simulation automatically when isRunning is true
  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(runStep, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, currentTime, processes, algorithm]);
  
  // Calculate metrics
  const calculateAverageWaitingTime = () => {
    if (completedProcesses.length === 0) return 0;
    const sum = completedProcesses.reduce((acc, p) => acc + p.waitingTime, 0);
    return (sum / completedProcesses.length).toFixed(2);
  };
  
  const calculateAverageTurnaroundTime = () => {
    if (completedProcesses.length === 0) return 0;
    const sum = completedProcesses.reduce((acc, p) => acc + p.turnaroundTime, 0);
    return (sum / completedProcesses.length).toFixed(2);
  };
  
  // Handle loading a saved experiment
  const handleLoadSavedExperiment = (experimentData) => {
    try {
      // Reset simulation first
      resetSimulation();
      
      // Load processes
      if (experimentData.input && experimentData.input.processes) {
        // Map saved processes to include remainingTime and other runtime properties
        const loadedProcesses = experimentData.input.processes.map(p => ({
          ...p,
          remainingTime: p.burstTime,
          completed: false,
          startTime: null,
          endTime: null
        }));
        
        setProcesses(loadedProcesses);
      }
      
      // Load algorithm
      if (experimentData.input && experimentData.input.algorithm) {
        setAlgorithm(experimentData.input.algorithm);
      }
      
      // Load time quantum for Round Robin
      if (experimentData.input && experimentData.input.timeQuantum) {
        setTimeQuantum(experimentData.input.timeQuantum);
      }
      
      // Load execution history if running the same simulation again
      if (experimentData.output && experimentData.output.executionHistory) {
        setExecutionHistory(experimentData.output.executionHistory);
      }
      
      // Load current time if continuing the simulation
      if (experimentData.output && experimentData.output.currentTime !== undefined) {
        setCurrentTime(experimentData.output.currentTime);
      }
      
      alert('Experiment loaded successfully');
    } catch (error) {
      console.error('Error loading experiment:', error);
      alert('Failed to load experiment data');
    }
  };
  
  return (
    <div className="process-scheduler p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Gantt Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">CPU Scheduling Timeline</h3>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">Current Time: <span className="font-medium">{currentTime}</span></span>
            </div>
            
            <div className="gantt-chart mt-4 overflow-x-auto">
              <div className="flex min-w-full">
                {executionHistory.map((event, index) => (
                  <div 
                    key={index}
                    className="gantt-block text-xs flex-shrink-0 h-10 flex items-center justify-center text-white font-medium"
                    style={{
                      width: '50px',
                      backgroundColor: event.color
                    }}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
              <div className="flex min-w-full border-t border-gray-200">
                {executionHistory.map((event, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-[50px] text-center text-xs text-gray-600 pt-1"
                  >
                    {event.time}
                  </div>
                ))}
                <div className="flex-shrink-0 w-[50px] text-center text-xs text-gray-600 pt-1">
                  {currentTime}
                </div>
              </div>
            </div>
            
            {/* Process Queue */}
            <div className="mt-8">
              <h4 className="font-medium text-gray-700 mb-2">Process Queue</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-md">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Process</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Burst Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {processes.map(process => (
                      <tr key={process.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: process.color }}
                            ></div>
                            {process.name}
                          </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{process.arrivalTime}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{process.burstTime}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{process.priority}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{process.remainingTime}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {process.completed ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : process.arrivalTime <= currentTime ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              Ready
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                              Waiting
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Performance Metrics */}
            {showMetrics && (
              <div className="mt-8">
                <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <h5 className="text-blue-700 font-medium mb-2">Average Waiting Time</h5>
                    <p className="text-2xl font-bold text-blue-800">{calculateAverageWaitingTime()} units</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <h5 className="text-green-700 font-medium mb-2">Average Turnaround Time</h5>
                    <p className="text-2xl font-bold text-green-800">{calculateAverageTurnaroundTime()} units</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div>
          {/* Control Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulation Controls</h3>
            
            {/* Algorithm Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduling Algorithm
              </label>
              <select
                value={algorithm}
                onChange={(e) => {
                  setAlgorithm(e.target.value);
                  resetSimulation();
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fcfs">First-Come-First-Served (FCFS)</option>
                <option value="sjf">Shortest Job First (SJF)</option>
                <option value="priority">Priority Scheduling</option>
                <option value="rr">Round Robin (RR)</option>
              </select>
            </div>
            
            {/* Time Quantum (for Round Robin) */}
            {algorithm === 'rr' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Quantum
                </label>
                <input
                  type="number"
                  min="1"
                  value={timeQuantum}
                  onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
            
            {/* Simulation Control Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-md text-white ${
                  isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRunning ? (
                  <><Pause className="h-4 w-4 inline mr-1" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 inline mr-1" /> Start</>
                )}
              </button>
              <button
                onClick={runStep}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipForward className="h-4 w-4 inline mr-1" /> Step
              </button>
              <button
                onClick={resetSimulation}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4 inline mr-1" /> Reset
              </button>
            </div>
            
            {/* Add New Process */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-700 mb-3">Add New Process</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Process Name
                  </label>
                  <input
                    type="text"
                    value={newProcess.name}
                    onChange={(e) => setNewProcess({...newProcess, name: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Time
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProcess.arrivalTime}
                    onChange={(e) => setNewProcess({
                      ...newProcess, 
                      arrivalTime: parseInt(e.target.value)
                    })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Burst Time
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProcess.burstTime}
                    onChange={(e) => {
                      const burstTime = parseInt(e.target.value);
                      setNewProcess({
                        ...newProcess, 
                        burstTime,
                        remainingTime: burstTime
                      });
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority (lower value = higher priority)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProcess.priority}
                    onChange={(e) => setNewProcess({...newProcess, priority: parseInt(e.target.value)})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={addProcess}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 inline mr-1" /> Add Process
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add ExperimentData component */}
      <ExperimentData
        processes={processes}
        algorithm={algorithm}
        timeQuantum={timeQuantum}
        executionHistory={executionHistory}
        completedProcesses={completedProcesses}
        currentTime={currentTime}
        onLoadSavedExperiment={handleLoadSavedExperiment}
      />
    </div>
  );
};

export default ProcessSchedulerSimulator;