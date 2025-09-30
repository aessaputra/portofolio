import HomeContentForm, { HomeContentFormProps } from "./Form";

export default function AdminHomePage() {
  const dummyContent: HomeContentFormProps = {
    headline: "",
    subheadline: "",
    resumeUrl: "",
    contactEmail: "",
    profileImagePath: "",
    githubUrl: "",
    linkedinUrl: "",
    xUrl: "",
    showHireMe: false,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Home Editor</h1>
      <div className="mt-8">
        <HomeContentForm content={dummyContent} />
      </div>
    </div>
  );
}