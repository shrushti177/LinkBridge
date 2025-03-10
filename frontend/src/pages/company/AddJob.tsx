import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { BaseUrl } from "../../App";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: string;
}

const AddJob = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Job",
    salary: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError(true);
      setLoading(false);
      return;
    }
  }, []);

  // Fetch jobs from the database on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${BaseUrl}/jobs/getJobs`, {
          headers: { 'Authorization': localStorage.getItem('token') }
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        // Check if it's an authentication error
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setAuthError(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Handle form submission & update job list
  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.type || !jobForm.salary || !jobForm.description) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setAuthError(true);
      alert("You need to be logged in to post a job");
      return;
    }

    try {
      const response = await axios.post(`${BaseUrl}/jobs/addJob`, jobForm, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': localStorage.getItem('token'),
        },
      });

      if (response.status === 201) {
        alert("Job posted successfully!");

        // Fetch jobs again to update UI
        const updatedJobs = await axios.get(`${BaseUrl}/jobs/getJobs`, {
          headers: { Authorization: token }
        });
        setJobs(updatedJobs.data);

        // Reset form after submission
        setJobForm({
          title: "",
          company: "",
          location: "",
          type: "Job",
          salary: "",
          description: "",
        });
      }
    } catch (error) {
      console.error("Error posting job:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setAuthError(true);
          alert("Authentication failed. Please log in again.");
        } else {
          alert(`Failed to post job: ${error.response?.data?.message || error.message}`);
        }
      } else {
        alert("Failed to post job. Please try again.");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  if (authError) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-6">You need to be logged in as a company to post jobs. Your session may have expired.</p>
          <button 
            onClick={handleLogin}
            className="bg-accent hover:bg-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Post a New Job</h1>
        
        <form onSubmit={handleAddJob} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
            <input type="text" name="title" value={jobForm.title} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input type="text" name="company" value={jobForm.company} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input type="text" name="location" value={jobForm.location} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select name="type" value={jobForm.type} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent">
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
            <input type="text" name="salary" value={jobForm.salary} onChange={handleChange} placeholder="e.g., $80,000 - $100,000" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" value={jobForm.description} onChange={handleChange} rows={4} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-accent" required />
          </div>

          <button type="submit" className="w-full bg-accent hover:bg-dark text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center">
            <FaPlus className="mr-2" /> Post Job
          </button>
        </form>
      </div>

      {/* Job List */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-800">Existing Jobs</h2>
        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {jobs.map((job) => (
              <li key={job._id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-gray-600">{job.company} - {job.location}</p>
                <p className="text-gray-500">{job.type} | {job.salary}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AddJob;