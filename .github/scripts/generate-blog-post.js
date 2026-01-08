const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Blog post topics related to grants
const topics = [
  'How to Write a Compelling Grant Proposal',
  'Top 10 Grant Writing Mistakes to Avoid',
  'Understanding Foundation vs. Government Grants',
  'How to Find Grants for Small Nonprofits',
  'Grant Budgeting Best Practices',
  'What is Fiscal Sponsorship and Do You Need It?',
  'How to Track Grant Deadlines Effectively',
  'Success Stories: Organizations That Won Major Grants',
  'Grant Reporting Requirements: A Complete Guide',
  'How to Build Relationships with Grant Funders',
  'Common Grant Application Questions and How to Answer Them',
  'How to Research Foundation Priorities',
  'Tips for First-Time Grant Applicants',
  'How to Write a Strong Letter of Inquiry',
  'Understanding Grant Eligibility Requirements',
  'How to Create a Grant Calendar',
  'What Funders Look for in Grant Applications',
  'How to Use AI Tools for Grant Research',
  'Grant Writing for Artists and Creatives',
  'How to Follow Up After Submitting a Grant'
];

async function generateBlogPost() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Pick a random topic
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  console.log(`Generating blog post: ${topic}`);
  
  const prompt = `Write a comprehensive, SEO-optimized blog post about: "${topic}"

Requirements:
- 800-1200 words
- Include actionable tips and examples
- Use subheadings (##)
- Write in a helpful, professional tone
- Include a call-to-action at the end mentioning Grant Geenie
- Format in Markdown
- Don't include the title in the body (it will be in frontmatter)

Return ONLY the markdown content without frontmatter.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    
    // Create frontmatter
    const slug = topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    
    const frontmatter = `---
layout: post
title: "${topic}"
date: ${dateStr} 09:00:00 -0600
categories: grant-tips
author: Grant Geenie Team
excerpt: "${content.split('\n')[0].substring(0, 150)}..."
---

`;

    const fullPost = frontmatter + content;
    
    // Save to file
    const filename = `${dateStr}-${slug}.md`;
    const filepath = path.join(__dirname, '../../blog/_posts', filename);
    
    fs.writeFileSync(filepath, fullPost);
    console.log(`✅ Blog post created: ${filename}`);
    
  } catch (error) {
    console.error('Error generating blog post:', error);
    process.exit(1);
  }
}

generateBlogPost();
