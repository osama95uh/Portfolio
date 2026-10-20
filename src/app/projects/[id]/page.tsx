import { projects as defaultProjects, type Project } from "@/src/data/projects";
import { getProjects } from "@/src/lib/db";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectList: Project[] = await getProjects().catch(() => defaultProjects);
  const project: Project | undefined = projectList.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative flex flex-col pt-24 pb-16">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 relative z-10">
        <div>
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-teal-400 font-medium mb-10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
        </div>

        <div className="relative w-full h-[40vh] md:h-[55vh] rounded-3xl overflow-hidden mb-16 border border-zinc-800 shadow-2xl">
          <Image
            src={project.image}
            alt={project.title}
            fill
            unoptimized={project.image.startsWith("http") || project.image.endsWith(".svg")}
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <div className="absolute bottom-10 left-6 right-6 md:left-10 md:right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2 sm:mb-4">
                {project.title}
              </h1>
              <p className="text-gray-300 text-sm sm:text-lg md:text-xl max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none">
                {project.description}
              </p>
            </div>
            
            <div className="flex items-center gap-4 shrink-0">
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 bg-zinc-900 border border-zinc-700 hover:border-teal-500 rounded-xl transition-all hover:text-teal-400 shadow-lg group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                  Source Code
                </a>
              )}
              {project.live && (
                <a href={project.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-medium rounded-xl transition-all shadow-lg shadow-teal-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-12 lg:gap-16">
          {/* Main Content Area */}
          <div className="space-y-16">
            
            {project.features?.length ? <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Key Features
              </h2>
              <div className="grid gap-4">
                {(project.features ?? []).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/60 hover:bg-zinc-900 transition-colors">
                    <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-teal-500/80" />
                    <span className="text-gray-300 leading-relaxed text-lg">{feature}</span>
                  </div>
                ))}
              </div>
            </section> : null}

            {project.challenges?.length ? <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Challenges Faced
              </h2>
              <div className="grid gap-4">
                {(project.challenges ?? []).map((challenge, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                     <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-amber-500/80" />
                    <span className="text-gray-300 leading-relaxed text-lg">{challenge}</span>
                  </div>
                ))}
              </div>
            </section> : null}

            {project.improvements?.length ? <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Future Improvements
              </h2>
              <div className="grid gap-4">
                {(project.improvements ?? []).map((improvement, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                     <div className="mt-2 min-w-[8px] h-[8px] rounded-full bg-blue-500/80" />
                    <span className="text-gray-300 leading-relaxed text-lg">{improvement}</span>
                  </div>
                ))}
              </div>
            </section> : null}
          </div>

          {/* Sidebar / Tech Stack */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 sticky top-24 shadow-xl">
              <h3 className="text-sm font-bold tracking-widest text-teal-400 uppercase mb-8 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {(project.tech ?? []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-zinc-950 border border-zinc-800 text-gray-300 hover:border-teal-500/50 hover:text-teal-400 transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
