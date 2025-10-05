-- Extend about_content table with skills, experiences, and education fields
ALTER TABLE about_content ADD COLUMN skills JSONB NOT NULL DEFAULT '[
  {"name": "HTML", "x": "-21vw", "y": "2vw"},
  {"name": "CSS", "x": "-6vw", "y": "-9vw"},
  {"name": "JavaScript", "x": "19vw", "y": "6vw"},
  {"name": "React", "x": "0vw", "y": "10vw"},
  {"name": "D3.js", "x": "-21vw", "y": "-15vw"},
  {"name": "THREEJS", "x": "19vw", "y": "-12vw"},
  {"name": "NextJS", "x": "31vw", "y": "-5vw"},
  {"name": "Python", "x": "19vw", "y": "-20vw"},
  {"name": "Tailwind CSS", "x": "0vw", "y": "-20vw"},
  {"name": "Figma", "x": "-24vw", "y": "18vw"},
  {"name": "Blender", "x": "17vw", "y": "17vw"}
]';

ALTER TABLE about_content ADD COLUMN experiences JSONB NOT NULL DEFAULT '[
  {
    "position": "Lorem Ipsum",
    "company": "Lorem Ipsum",
    "companyLink": "/",
    "time": "2022-Present",
    "address": "Lorem, Ipsum",
    "work": [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ]
  },
  {
    "position": "Lorem Ipsum",
    "company": "Lorem Ipsum",
    "companyLink": "/",
    "time": "2022-Present",
    "address": "Lorem, Ipsum",
    "work": [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ]
  },
  {
    "position": "Lorem Ipsum",
    "company": "Lorem Ipsum",
    "companyLink": "/",
    "time": "2022-Present",
    "address": "Lorem, Ipsum",
    "work": [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    ]
  }
]';

ALTER TABLE about_content ADD COLUMN education JSONB NOT NULL DEFAULT '[
  {
    "type": "Lorem Ipsum",
    "time": "2022-2026",
    "place": "Lorem Ipsum Dolor Sit Amet",
    "info": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    "type": "Lorem Ipsum",
    "time": "2022-2026",
    "place": "Lorem Ipsum Dolor Sit Amet",
    "info": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  },
  {
    "type": "Lorem Ipsum",
    "time": "2022-2026",
    "place": "Lorem Ipsum Dolor Sit Amet",
    "info": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  }
]';