export const PORTFOLIO_QUERY = /* GraphQL */ `
  query Portfolio($slug: String!) {
    allSiteSettings(where: { slug: $slug }, stage: PUBLISHED, first: 1) {
      slug
      fullName
      nickname
      email
      location
      timezone
      heroLabel
      heroTagline
      aboutHeading
      aboutBio
      contactIntro
      footerLine1
      footerLine2
      resumeUrl
      resume {
        url
        fileName
        mimeType
        size
      }
      aboutPhoto {
        url
        fileName
        mimeType
        width
        height
      }
      openToWork
      avgResponse
      lookingFor
      typewriterNames
      marqueeItems
      packageName
      packageRole
      versionTooltip
      metaTitle
      metaDescription
      metaKeywords
      ogTitle
      ogDescription
      ogSiteName
      twitterTitle
      twitterDescription
      siteUrl
      heroStats {
        value
        suffix
        label
        numericValue
        sortOrder
        section
      }
      aboutStats {
        value
        suffix
        label
        numericValue
        sortOrder
        section
      }
      navLinks {
        label
        href
        sortOrder
      }
      contactLinks {
        label
        value
        href
        sortOrder
      }
      statusLines {
        label
        value
        valueClass
        sortOrder
      }
    }
    skillCategories(stage: PUBLISHED, orderBy: sortOrder_ASC, first: 50) {
      key
      displayLabel
      theme
      sortOrder
      skills(orderBy: sortOrder_ASC) {
        name
        version
        sortOrder
      }
    }
    experiences(stage: PUBLISHED, orderBy: sortOrder_ASC, first: 50) {
      hash
      role
      company
      period
      tag
      isHead
      author
      sortOrder
      points {
        text
        sortOrder
      }
    }
    achievements(stage: PUBLISHED, orderBy: sortOrder_ASC, first: 50) {
      title
      event
      placement
      description
      highlight
      topics
      certificateUrl
      certificateUrls
      certificates {
        url
        fileName
        mimeType
        width
        height
      }
      sortOrder
    }
    projects(stage: PUBLISHED, orderBy: sortOrder_ASC, first: 50) {
      name
      organization
      description
      highlight
      stack
      githubUrl
      liveUrl
      isInternal
      sortOrder
    }
  }
`;
