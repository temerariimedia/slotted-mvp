import React from 'react'
import { 
  Globe, 
  Mail, 
  MessageCircle, 
  Search,
  FileText,
  Users,
  Video,
  Smartphone
} from 'lucide-react'
import { ChannelOption } from '../types/marketing'

export const CHANNEL_CATEGORIES = {
  digital: {
    name: 'Digital Marketing',
    description: 'Online channels for reaching digital audiences',
    icon: React.createElement(Globe, { className: "w-5 h-5 text-blue-600" }),
    options: [
      {
        id: 'website',
        name: 'Website',
        description: 'Your primary digital presence and conversion hub',
        metrics: ['traffic', 'bounce_rate', 'conversion_rate', 'page_views'],
        recommendedStages: ['awareness', 'consideration', 'decision']
      },
      {
        id: 'seo',
        name: 'SEO',
        description: 'Organic search engine optimization for long-term visibility',
        metrics: ['organic_traffic', 'keyword_rankings', 'backlinks', 'domain_authority'],
        recommendedStages: ['awareness', 'consideration']
      },
      {
        id: 'ppc',
        name: 'PPC/Google Ads',
        description: 'Paid search advertising for immediate visibility',
        metrics: ['cpc', 'ctr', 'conversion_rate', 'roas'],
        recommendedStages: ['awareness', 'decision']
      },
      {
        id: 'display_ads',
        name: 'Display Advertising',
        description: 'Banner and visual ads across the web',
        metrics: ['impressions', 'ctr', 'viewability', 'brand_lift'],
        recommendedStages: ['awareness']
      }
    ],
    tooltips: {
      website: 'Your website is your digital headquarters - optimize for conversions',
      seo: 'SEO takes time but provides sustainable, cost-effective traffic',
      ppc: 'PPC provides immediate results but requires ongoing budget',
      display_ads: 'Great for brand awareness and retargeting campaigns'
    }
  },
  social: {
    name: 'Social Media',
    description: 'Social platforms for community building and engagement',
    icon: React.createElement(MessageCircle, { className: "w-5 h-5 text-green-600" }),
    options: [
      {
        id: 'linkedin',
        name: 'LinkedIn',
        description: 'Professional networking and B2B marketing',
        metrics: ['followers', 'engagement_rate', 'leads', 'impressions'],
        recommendedStages: ['awareness', 'consideration', 'retention']
      },
      {
        id: 'facebook',
        name: 'Facebook',
        description: 'Broad audience reach and community building',
        metrics: ['followers', 'engagement_rate', 'reach', 'conversions'],
        recommendedStages: ['awareness', 'consideration', 'retention']
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        description: 'Real-time conversations and thought leadership',
        metrics: ['followers', 'engagement_rate', 'mentions', 'retweets'],
        recommendedStages: ['awareness', 'retention']
      },
      {
        id: 'instagram',
        name: 'Instagram',
        description: 'Visual storytelling and brand personality',
        metrics: ['followers', 'engagement_rate', 'reach', 'story_views'],
        recommendedStages: ['awareness', 'consideration']
      }
    ],
    tooltips: {
      linkedin: 'Essential for B2B companies and professional services',
      facebook: 'Great for local businesses and community building',
      twitter: 'Perfect for real-time engagement and customer service',
      instagram: 'Visual brands and younger demographics thrive here'
    }
  },
  content: {
    name: 'Content Marketing',
    description: 'Educational and valuable content to attract audiences',
    icon: React.createElement(FileText, { className: "w-5 h-5 text-purple-600" }),
    options: [
      {
        id: 'blog',
        name: 'Blog',
        description: 'Educational articles and thought leadership content',
        metrics: ['page_views', 'time_on_page', 'shares', 'leads'],
        recommendedStages: ['awareness', 'consideration']
      },
      {
        id: 'newsletter',
        name: 'Newsletter',
        description: 'Regular email content to nurture subscribers',
        metrics: ['subscribers', 'open_rate', 'click_rate', 'unsubscribe_rate'],
        recommendedStages: ['consideration', 'retention']
      },
      {
        id: 'podcast',
        name: 'Podcast',
        description: 'Audio content for deep engagement and authority',
        metrics: ['downloads', 'subscribers', 'listen_time', 'reviews'],
        recommendedStages: ['awareness', 'consideration']
      },
      {
        id: 'youtube',
        name: 'YouTube',
        description: 'Video content for education and entertainment',
        metrics: ['views', 'subscribers', 'watch_time', 'engagement'],
        recommendedStages: ['awareness', 'consideration']
      }
    ],
    tooltips: {
      blog: 'Cornerstone of content marketing - drives SEO and establishes expertise',
      newsletter: 'Direct line to your audience - high ROI when done right',
      podcast: 'Builds deep relationships and authority in your niche',
      youtube: 'Second largest search engine - great for tutorials and demos'
    }
  },
  email: {
    name: 'Email Marketing',
    description: 'Direct communication with your audience',
    icon: React.createElement(Mail, { className: "w-5 h-5 text-orange-600" }),
    options: [
      {
        id: 'email_campaigns',
        name: 'Email Campaigns',
        description: 'Targeted email marketing to segments',
        metrics: ['open_rate', 'click_rate', 'conversion_rate', 'roi'],
        recommendedStages: ['consideration', 'decision', 'retention']
      },
      {
        id: 'automation',
        name: 'Email Automation',
        description: 'Triggered email sequences and workflows',
        metrics: ['automation_rate', 'revenue_per_email', 'lifecycle_progression'],
        recommendedStages: ['consideration', 'decision', 'retention']
      },
      {
        id: 'transactional',
        name: 'Transactional Emails',
        description: 'Order confirmations, receipts, and notifications',
        metrics: ['delivery_rate', 'open_rate', 'customer_satisfaction'],
        recommendedStages: ['decision', 'retention']
      }
    ],
    tooltips: {
      email_campaigns: 'Highest ROI marketing channel when executed properly',
      automation: 'Set-and-forget sequences that nurture leads automatically',
      transactional: 'Often overlooked but high engagement opportunity'
    }
  }
}

export const getChannelMetrics = (channelId: string): string[] => {
  for (const category of Object.values(CHANNEL_CATEGORIES)) {
    const channel = category.options.find(opt => opt.id === channelId)
    if (channel) {
      return channel.metrics
    }
  }
  return []
}