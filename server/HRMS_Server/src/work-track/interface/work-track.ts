export interface WorkTrack {
  employee_id: number;
  date: string;
  hours: {
    start_time: string;
    end_time: string;
    task: string;
    project: string;
    type: 'work' | 'break';
  }[];
  technologies: string[];
  total: number;
}