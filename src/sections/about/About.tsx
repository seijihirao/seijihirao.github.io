export default function About() {
  return (
    <div className="hero" id='about'>
      <div className="h-screen overflow-hidden">
        <img
          alt="Luna <3"
          src={process.env.PUBLIC_URL + '/assets/bg/about.jpg'}
          className="contrast-[.90] brightness-[.40] hue-rotate-180 object-cover min-h-full"
        />
      </div>
      <div className="hero-content min-h-screen w-full px-5">
        <div>
          <h1 className="text-3xl font-bold">
            Experienced Software Developer with Diverse Industry Background and
            a Focus on Scalability and Robust Solutions.
          </h1>
          <div className="flex pt-5">
            <a href="https://www.linkedin.com/in/seijihirao/" className="mr-6">
              <img
                alt="LinkedIn"
                src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"
                className="border border-white"
              />
            </a>
            <a href="https://github.com/seijihirao" className="mr-6">
              <img
                alt="Github"
                src="https://img.shields.io/badge/Github-000000?style=for-the-badge&logo=github&logoColor=white"
                className="border border-white"
              />
            </a>
            <a href="https://stackoverflow.com/users/2901111/seiji-hirao" className="mr-6">
              <img
                alt="Stackoverflow"
                src="https://img.shields.io/badge/Stack_Overflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white"
                className="border border-white"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
