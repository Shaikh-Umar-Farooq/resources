const courseData = {
    beginner: {
        title: "Beginner Level",
        chapters: [
            {
                title: "Design Principles",
                resources: [
                    {
                        type: "video",
                        title: "Beginning Graphic Design: Fundamentals",
                        description: "Learn about the fundamental principles of design including typography, colors, shapes, and more.",
                        url: "https://www.youtube.com/watch?v=YqQx75OPRa0",
                        thumbnail: "https://img.youtube.com/vi/YqQx75OPRa0/maxresdefault.jpg",
                        author: "GCFLearnFree",
                        completed: false
                    },
                    {
                        type: "video",
                        title: "Gestalt Psychology and Web Design",
                        description: "Understanding how human perception works and how to apply Gestalt principles to your designs.",
                        url: "https://www.youtube.com/watch?v=JLQ2UAdf2eQ",
                        thumbnail: "https://img.youtube.com/vi/JLQ2UAdf2eQ/maxresdefault.jpg",
                        author: "UX Foundations",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "Color Theory for Designers",
                        description: "Learn how to use color effectively in your designs with this comprehensive guide to color theory.",
                        url: "https://www.smashingmagazine.com/2010/01/color-theory-for-designers-part-1-the-meaning-of-color/",
                        author: "Cameron Chapman",
                        publisher: "Smashing Magazine",
                        completed: false
                    }
                ]
            },
            
            {
                title: "Introduction to UI/UX",
                resources: [
                    {
                        type: "video",
                        title: "What Is UI vs. UX Design?",
                        description: "A beginner-friendly introduction to UI and UX design, explaining the key differences and how they work together.",
                        url: "https://www.youtube.com/watch?v=TgqeRTwZvIo",
                        thumbnail: "https://img.youtube.com/vi/TgqeRTwZvIo/maxresdefault.jpg",
                        author: "Maze",
                        completed: false
                    },
                    {
                        type: "video",
                        title: "Design Thinking Process",
                        description: "Learn the five stages of Design Thinking and how to apply them to your design projects.",
                        url: "https://www.youtube.com/watch?v=_r0VX-aU_T8",
                        thumbnail: "https://img.youtube.com/vi/_r0VX-aU_T8/maxresdefault.jpg",
                        author: "Google for Startups",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "The Basics of User Experience Design",
                        description: "A comprehensive guide to understanding the fundamentals of UX design and its importance in modern product development.",
                        url: "https://www.interaction-design.org/literature/topics/ux-design",
                        author: "Interaction Design Foundation",
                        publisher: "Interaction Design Foundation",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "What is User Interface Design?",
                        description: "Learn about UI design principles, best practices, and how it differs from UX design.",
                        url: "https://www.coursera.org/articles/ui-design",
                        author: "Coursera Team",
                        publisher: "Coursera",
                        completed: false
                    }
                ]
            }

        ]
    },
    intermediate: {
        title: "Intermediate Level",
        chapters: [
            {
                title: "User Research Methods",
                resources: [
                    {
                        type: "video",
                        title: "UX Research Methods Overview",
                        description: "A comprehensive overview of different user research methods and when to use them.",
                        url: "https://www.youtube.com/watch?v=gGZGDnTY454",
                        thumbnail: "https://img.youtube.com/vi/gGZGDnTY454/maxresdefault.jpg",
                        author: "Google Design",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "How to Conduct User Interviews",
                        description: "A step-by-step guide to planning, conducting, and analyzing user interviews.",
                        url: "https://www.nngroup.com/articles/user-interviews/",
                        author: "Jakob Nielsen",
                        publisher: "Nielsen Norman Group",
                        completed: false
                    }
                ]
            },
            {
                title: "Wireframing & Prototyping",
                resources: [
                    {
                        type: "video",
                        title: "Wireframing for UX Design",
                        description: "Learn how to create effective wireframes and the importance of low-fidelity prototyping.",
                        url: "https://www.youtube.com/watch?v=qpH7-KFWZRI",
                        thumbnail: "https://img.youtube.com/vi/qpH7-KFWZRI/maxresdefault.jpg",
                        author: "Figma",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "The Ultimate Guide to Prototyping",
                        description: "Everything you need to know about creating prototypes, from paper to high-fidelity digital versions.",
                        url: "https://www.uxpin.com/studio/blog/prototype-ui-guide/",
                        author: "Jerry Cao",
                        publisher: "UXPin",
                        completed: false
                    }
                ]
            }
        ]
    },
    advanced: {
        title: "Advanced Level",
        chapters: [
            {
                title: "Design Systems",
                resources: [
                    {
                        type: "video",
                        title: "Creating a Design System from Scratch",
                        description: "Learn how to build and maintain a comprehensive design system for your products.",
                        url: "https://www.youtube.com/watch?v=RYDiDpW2VkM",
                        thumbnail: "https://img.youtube.com/vi/RYDiDpW2VkM/maxresdefault.jpg",
                        author: "DesignCourse",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "Design Systems Handbook",
                        description: "A comprehensive guide to creating, maintaining and evolving design systems.",
                        url: "https://www.designbetter.co/design-systems-handbook",
                        author: "Marco Suarez",
                        publisher: "InVision",
                        completed: false
                    }
                ]
            },
            {
                title: "Advanced UI Animation",
                resources: [
                    {
                        type: "video",
                        title: "Micro-interactions and Animation in UI",
                        description: "Master the art of creating meaningful animations and micro-interactions.",
                        url: "https://www.youtube.com/watch?v=0iw6dD3s8E8",
                        thumbnail: "https://img.youtube.com/vi/0iw6dD3s8E8/maxresdefault.jpg",
                        author: "DesignCode",
                        completed: false
                    },
                    {
                        type: "article",
                        title: "The UX of Animation",
                        description: "Understanding how to use animation to enhance user experience and product functionality.",
                        url: "https://www.smashingmagazine.com/2021/09/modern-css-solutions-for-common-animations/",
                        author: "Sarah Drasner",
                        publisher: "Smashing Magazine",
                        completed: false
                    }
                ]
            }
        ]
    }
};