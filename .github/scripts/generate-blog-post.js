const fs = require('fs');
const path = require('path');

// Blog post topics related to grants
const topics = [
  'How to Write a Compelling Grant Proposal in 2026',
  'Top 10 Grant Writing Mistakes to Avoid',
  'Understanding Foundation vs. Government Grants',
  'How to Find Grants for Small Nonprofits',
  'Grant Budgeting Best Practices for 2026',
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
  'How to Follow Up After Submitting a Grant',
  'Federal Grant Opportunities in 2026',
  'State and Local Grant Programs Guide',
  'Corporate Giving Programs: How to Apply',
  'Grant Writing Software and Tools Review',
  'Building a Grant-Ready Organization'
];

async function generateBlogPost() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  
  // Pick a random topic
  const topic = topics[Math.floor(Math.random() * topics.length)];
  
  console.log(`Generating blog post: ${topic}`);
  
  const prompt = `Write a comprehensive, SEO-optimized blog post about: "${topic}"

Requirements:
- 1000-1500 words
- Include actionable tips with real examples
- Use markdown subheadings (##, ###)
- Include current statistics and data for 2026
- Write in a helpful, professional, conversational tone
- Include bullet points for key takeaways
- End with a brief call-to-action mentioning Grant Geenie (https://granthustle.org) as a helpful tool
- Format in clean Markdown
- Don't include the title in the body (it will be in frontmatter)
- Be thorough and informative

Return ONLY the markdown content without frontmatter or title.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert grant writer and nonprofit funding consultant. Write detailed, research-backed blog posts that help organizations secure funding.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        return_citations: true,
        return_images: false
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Add citations if available
    if (data.citations && data.citations.length > 0) {
      content += '\n\n## Sources\n\n';
      data.citations.forEach((citation, index) => {
        content += `${index + 1}. [${citation}](${citation})\n`;
      });
    }
    
    // Create frontmatter
    const slug = topic.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
    
    // Extract first paragraph for excerpt
    const firstParagraph = content.split('\n\n')[0].replace(/[#*]/g, '').trim();
    const excerpt = firstParagraph.substring(0, 155) + '...';
    
    const frontmatter = `---
layout: post
title: "${topic}"
date: ${dateStr} 09:00:00 -0600
categories: grant-tips
author: Grant Geenie Team
excerpt: "${excerpt}"
---

`;

    const fullPost = frontmatter + content;
    
    // Create _posts directory if it doesn't exist
    const postsDir = path.join(__dirname, '../../blog/_posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }
    
    // Save to file
    const filename = `${dateStr}-${slug}.md`;
    const filepath = path.join(postsDir, filename);
    
    fs.writeFileSync(filepath, fullPost);
    console.log(`✅ Blog post created: ${filename}`);
    console.log(`📊 Word count: ~${content.split(' ').length} words`);
    
  } catch (error) {
    console.error('❌ Error generating blog post:', error.message);
    process.exit(1);
  }
}

generateBlogPost();
