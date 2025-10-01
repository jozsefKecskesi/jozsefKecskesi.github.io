import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Envelope, GithubLogo, LinkedinLogo, ArrowUpRight, GraduationCap, Code, TrendUp } from "@phosphor-icons/react"
import neuralNetworkSvg from "@/assets/images/ai-neural-network.svg"
import dataVisualizationSvg from "@/assets/images/data-visualization.svg"
import brainCircuitSvg from "@/assets/images/brain-circuit.svg"

function App() {
  const skills = {
    "Data Analysis": ["SQL Server", "SSIS", "SSRS", "Power BI", "Tableau", "Excel", "T-SQL", "Data Warehousing"],
    "Development": ["C#", ".NET", "Visual Studio", "ASP.NET", "Entity Framework", "WPF", "Windows Forms", "REST APIs"],
    "AI & Machine Learning": ["Python", "Scikit-learn", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Computer Vision"],
    "Tools & Platforms": ["SQL Server Management Studio", "Azure", "Git", "IIS", "Windows Server", "Team Foundation Server"]
  }

  const projects = [
    {
      title: "NTPF Enhanced Waiting List Dashboard",
      description: "Public Power BI dashboard analyzing healthcare waiting list data with interactive visualizations and trend analysis for the National Treatment Purchase Fund.",
      tech: ["Power BI", "DAX", "Data Modeling", "Healthcare Analytics"],
      type: "Data Analysis",
      link: "https://www.ntpf.ie/enhanced-waiting-list-data/"
    },
    {
      title: "Customer Churn Prediction",
      description: "ML model predicting customer churn with 89% accuracy, deployed as a .NET web application with SQL Server backend.",
      tech: ["Python", "C#", "ASP.NET", "SQL Server"],
      type: "Machine Learning",
      link: "#"
    },
    {
      title: "Data Warehouse Solution",
      description: "Complete ETL solution using SSIS for data integration, with automated reporting through SSRS and Power BI dashboards.",
      tech: ["SSIS", "SSRS", "SQL Server", "Power BI"],
      type: "Development",
      link: "#"
    },
    {
      title: "NLP Research Project",
      description: "MSc research on sentiment analysis using transformer models, achieving state-of-the-art results on domain-specific datasets.",
      tech: ["Python", "PyTorch", "Transformers", "BERT"],
      type: "Research",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-cyan-500/10">
        {/* Animated Background Graphics */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Neural Network - Top Right */}
          <div className="absolute -top-20 -right-40 w-96 h-96 opacity-20 animate-pulse">
            <img src={neuralNetworkSvg} alt="" className="w-full h-full object-contain" />
          </div>
          
          {/* Data Visualization - Left Side */}
          <div className="absolute top-1/4 -left-20 w-80 h-64 opacity-25 animate-bounce-slow">
            <img src={dataVisualizationSvg} alt="" className="w-full h-full object-contain" />
          </div>
          
          {/* Brain Circuit - Bottom Right */}
          <div className="absolute bottom-10 right-10 w-72 h-48 opacity-30 animate-pulse">
            <img src={brainCircuitSvg} alt="" className="w-full h-full object-contain" />
          </div>
          
          {/* Floating Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-25 blur-lg animate-float-delayed"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 blur-lg animate-float-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Jozsef Kecskesi
              </h1>
              <p className="text-xl lg:text-2xl text-foreground/80 font-medium">
                Data Analyst & AI Developer
              </p>
              <p className="text-lg text-foreground/70 font-medium">
                Transforming data into insights, building intelligent solutions
              </p>
            </div>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              I'm currently pursuing MSc in Artificial Intelligence at Munster Technological University while working as a data analyst and developer. 
              I specialize in developing powerful Power BI reports and ETL solutions using Microsoft technologies.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = 'mailto:R00277131@mymtu.ie'}
              >
                <Envelope size={20} />
                Get In Touch
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-all duration-300"
                onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ArrowUpRight size={20} />
                View Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground">
                Skills & Expertise
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                My expertise in Power BI reporting, ETL development, and Microsoft data platform solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(skills).map(([category, skillList]) => (
                <Card key={category} className="border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      {category === "Data Analysis" && <TrendUp size={24} className="text-emerald-500" />}
                      {category === "Development" && <Code size={24} className="text-blue-500" />}
                      {category === "AI & Machine Learning" && <GraduationCap size={24} className="text-purple-500" />}
                      {category === "Tools & Platforms" && <Code size={24} className="text-orange-500" />}
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillList.map((skill) => (
                        <Badge key={skill} variant="secondary" className="font-medium bg-gradient-to-r from-secondary to-primary/10 hover:from-primary/10 hover:to-secondary transition-all duration-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Projects Section */}
      <section id="projects-section" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-semibold text-foreground">
                Featured Projects
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Showcasing my Power BI dashboards, ETL solutions, and machine learning applications using Microsoft technologies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <Card 
                  key={index} 
                  className="border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group bg-gradient-to-br from-card via-card to-accent/5 cursor-pointer"
                  onClick={() => project.link !== '#' && window.open(project.link, '_blank')}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Badge 
                          variant="outline" 
                          className={`w-fit ${
                            project.type === 'Data Analysis' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                            project.type === 'Machine Learning' ? 'border-purple-300 text-purple-700 bg-purple-50' :
                            project.type === 'Development' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                            'border-orange-300 text-orange-700 bg-orange-50'
                          }`}
                        >
                          {project.type}
                        </Badge>
                        <CardTitle className="text-foreground group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                      </div>
                      {project.link !== '#' && (
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10">
                          <ArrowUpRight size={16} />
                        </Button>
                      )}
                    </div>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs font-medium bg-gradient-to-r from-muted to-primary/5 hover:from-primary/5 hover:to-muted transition-all duration-200">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Education & Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Education */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                  <GraduationCap size={28} className="text-primary" />
                  Education
                </h2>
                <Card className="border-border/50 bg-gradient-to-br from-card to-primary/5 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
                      MSc Artificial Intelligence
                    </CardTitle>
                    <CardDescription>
                      Munster Technological University (MTU) • Expected graduation 2027
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      I'm specializing in machine learning, deep learning, and natural language processing. 
                      My research focuses on transformer architectures and their applications in domain-specific tasks.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact */}
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Let's Connect
                </h2>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    I'm open to opportunities in data analytics, Power BI development, ETL solutions, and AI research. 
                    Let's discuss how we can work together!
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all duration-300" 
                      size="lg"
                      onClick={() => window.location.href = 'mailto:R00277131@mymtu.ie'}
                    >
                      <Envelope size={20} className="text-blue-500" />
                      R00277131@mymtu.ie
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 transition-all duration-300" 
                      size="lg"
                      onClick={() => window.open('https://www.linkedin.com/in/jozsefkecskesi/', '_blank')}
                    >
                      <LinkedinLogo size={20} className="text-blue-600" />
                      LinkedIn Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start gap-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:border-gray-400 transition-all duration-300" 
                      size="lg"
                      onClick={() => window.open('https://github.com/jozsefKecskesi', '_blank')}
                    >
                      <GithubLogo size={20} className="text-gray-700" />
                      GitHub Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Jozsef Kecskesi • Data Analyst & AI Developer</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App