'use client';

import { useFormState } from 'react-dom';
import { updateHomeContent } from './actions';

export type HomeContentFormProps = {
  headline: string;
  subheadline: string;
  resumeUrl: string;
  contactEmail: string;
  profileImagePath: string;
  githubUrl: string;
  linkedinUrl: string;
  xUrl: string;
  showHireMe: boolean;
}

export default function HomeContentForm({ content }: { content: HomeContentFormProps }) {
  const [state, formAction] = useFormState(updateHomeContent, { success: false, error: null });

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6">
      {state?.error && <p className="text-red-500 col-span-full">{state.error}</p>}
      
      <div>
        <label htmlFor="headline" className="block text-sm font-medium">Headline</label>
        <textarea id="headline" name="headline" defaultValue={content.headline} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>

      <div>
        <label htmlFor="subheadline" className="block text-sm font-medium">Subheadline</label>
        <textarea id="subheadline" name="subheadline" defaultValue={content.subheadline} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>

      {/* ... other fields ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-medium">Resume URL</label>
          <input type="text" id="resumeUrl" name="resumeUrl" defaultValue={content.resumeUrl} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium">Contact Email</label>
          <input type="email" id="contactEmail" name="contactEmail" defaultValue={content.contactEmail} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
      </div>

      <div>
        <label htmlFor="profileImagePath" className="block text-sm font-medium">Profile Image Path</label>
        <input type="text" id="profileImagePath" name="profileImagePath" defaultValue={content.profileImagePath} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium">GitHub URL</label>
              <input type="text" id="githubUrl" name="githubUrl" defaultValue={content.githubUrl} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium">LinkedIn URL</label>
              <input type="text" id="linkedinUrl" name="linkedinUrl" defaultValue={content.linkedinUrl} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
          <div>
              <label htmlFor="xUrl" className="block text-sm font-medium">X (Twitter) URL</label>
              <input type="text" id="xUrl" name="xUrl" defaultValue={content.xUrl} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
          </div>
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input id="showHireMe" name="showHireMe" type="checkbox" defaultChecked={content.showHireMe} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="showHireMe" className="font-medium">Show &apos;Hire Me&apos; Button</label>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save Changes
        </button>
      </div>
    </form>
  );
}
