import React from 'react';

// Type definitions for better type safety
interface ParseResult {
  beforeMatch: string;
  element: React.ReactElement;
  afterMatch: string;
  matchLength: number;
}

type ParserFunction = (text: string, key?: number) => ParseResult | null;

interface ListItem {
  number: string;
  content: string;
}

// Configuration object for maintainability
const FORMATTER_CONFIG = {
  styles: {
    bold: 'font-semibold text-gray-800',
    link: 'text-blue-600 hover:text-blue-800 underline',
    linkExternal: 'text-blue-600 hover:text-blue-800 underline break-all',
    header: {
      base: 'font-bold text-gray-900 mb-2 mt-3',
      sizes: {
        1: 'text-xl',
        2: 'text-lg',
        3: 'text-base',
        4: 'text-base',
        5: 'text-sm',
        6: 'text-sm'
      }
    },
    table: {
      wrapper: 'overflow-x-auto my-2',
      table: 'min-w-full border border-gray-200 rounded',
      headerRow: 'bg-gray-100',
      headerCell: 'px-3 py-2 text-left text-sm font-medium border-b border-gray-200',
      cell: 'px-3 py-2 text-sm border-b border-gray-100'
    },
    list: {
      ordered: 'space-y-2 ml-4',
      listItem: 'flex',
      number: 'font-semibold text-gray-700 mr-2 min-w-[2rem]',
      content: 'flex-1',
      subList: 'mt-1 ml-4 space-y-1',
      subItem: 'text-sm'
    }
  },
  regex: {
    bold: /\*\*(.*?)\*\*/,
    header: /^(#{1,6})\s+(.+)$/m,
    emailLink: /\[([^\]]+)\]\(mailto:([^)]+)\)/,
    regularLink: /\[([^\]]+)\]\(([^)]+)\)/,
    // Simplified URL regex for better performance
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    numberedList: /^\s*(\d+)\.\s+(.*)$/,
    numberedListWithBold: /^\s*(\d+)\.\s*\*\*\d+\.\*\*\s*(.*)$/,
    tableRow: /\|.*\|/,
    tableSeparator: /^[\s\|\-:]+$/
  }
};

// Utility functions for validation
const isValidString = (text: unknown): text is string => {
  return typeof text === 'string' && text.trim().length > 0;
};

const safeSubstring = (text: string, start: number, end?: number): string => {
  if (start < 0 || start > text.length) return '';
  return text.substring(start, end);
};

// SOLID Principle: Single Responsibility - Each formatter handles one type of content
class TextFormatterParsers {
  
  // Bold text parser with proper return type
  static parseBold(text: string, key: number = 0): ParseResult | null {
    if (!isValidString(text)) return null;
    
    const match = text.match(FORMATTER_CONFIG.regex.bold);
    if (!match || match.index === undefined) return null;
    
    return {
      beforeMatch: safeSubstring(text, 0, match.index),
      element: <strong key={key} className={FORMATTER_CONFIG.styles.bold}>{match[1]}</strong>,
      afterMatch: safeSubstring(text, match.index + match[0].length),
      matchLength: match[0].length
    };
  }

  // Header parser with validation
  static parseHeader(text: string, key: number = 0): ParseResult | null {
    if (!isValidString(text)) return null;
    
    const match = text.match(FORMATTER_CONFIG.regex.header);
    if (!match || match.index === undefined) return null;
    
    const level = Math.min(match[1].length, 6) as 1 | 2 | 3 | 4 | 5 | 6;
    const headerText = match[2].trim();
    
    // Remove trailing ## if present
    const cleanText = headerText.replace(/\s*##\s*$/, '');
    
    const className = `${FORMATTER_CONFIG.styles.header.base} ${FORMATTER_CONFIG.styles.header.sizes[level]}`;
    
    const headerElement = React.createElement(
      `h${level}`,
      { key, className },
      cleanText
    );
    
    return {
      beforeMatch: safeSubstring(text, 0, match.index),
      element: headerElement,
      afterMatch: safeSubstring(text, match.index + match[0].length),
      matchLength: match[0].length
    };
  }

  // Email link parser with validation
  static parseEmailLink(text: string, key: number = 0): ParseResult | null {
    if (!isValidString(text)) return null;
    
    const match = text.match(FORMATTER_CONFIG.regex.emailLink);
    if (!match || match.index === undefined) return null;
    
    // Validate email format
    const email = match[2];
    if (!email.includes('@')) return null;
    
    return {
      beforeMatch: safeSubstring(text, 0, match.index),
      element: (
        <a 
          key={key} 
          href={`mailto:${email}`}
          className={FORMATTER_CONFIG.styles.link}
        >
          {match[1]}
        </a>
      ),
      afterMatch: safeSubstring(text, match.index + match[0].length),
      matchLength: match[0].length
    };
  }

  // Regular link parser with validation
  static parseRegularLink(text: string, key: number = 0): ParseResult | null {
    if (!isValidString(text)) return null;
    
    const match = text.match(FORMATTER_CONFIG.regex.regularLink);
    if (!match || match.index === undefined) return null;
    
    // Basic URL validation
    const url = match[2];
    if (!url || url.length === 0) return null;
    
    return {
      beforeMatch: safeSubstring(text, 0, match.index),
      element: (
        <a 
          key={key} 
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={FORMATTER_CONFIG.styles.link}
        >
          {match[1]}
        </a>
      ),
      afterMatch: safeSubstring(text, match.index + match[0].length),
      matchLength: match[0].length
    };
  }

  // Simplified URL parser with better performance
  static parseAutoURL(text: string, key: number = 0): ParseResult | null {
    if (!isValidString(text)) return null;
    
    const match = text.match(FORMATTER_CONFIG.regex.url);
    if (!match || match.index === undefined) return null;
    
    const url = match[0];
    // Add http:// if URL doesn't start with http:// or https://
    const href = url.match(/^https?:\/\//) ? url : `http://${url}`;
    
    return {
      beforeMatch: safeSubstring(text, 0, match.index),
      element: (
        <a 
          key={key} 
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={FORMATTER_CONFIG.styles.linkExternal}
        >
          {url}
        </a>
      ),
      afterMatch: safeSubstring(text, match.index + match[0].length),
      matchLength: match[0].length
    };
  }

  // Table detector with validation
  static isTable(text: string): boolean {
    if (!isValidString(text)) return false;
    return FORMATTER_CONFIG.regex.tableRow.test(text);
  }

  // Improved table parser with error handling
  static parseMarkdownTable(text: string): React.ReactElement {
    if (!isValidString(text)) {
      return <span>Invalid table data</span>;
    }

    try {
      const lines = text.split('\n').filter(line => line.trim());
      const tableLines = lines.filter(line => line.includes('|'));
      
      if (tableLines.length < 2) {
        return <span>{text}</span>;
      }

      // Parse header
      const headerCells = tableLines[0]
        .split('|')
        .map(cell => cell.trim())
        .filter(cell => cell);

      // Skip separator line and get data rows
      const dataRows = tableLines
        .slice(1)
        .filter(line => !FORMATTER_CONFIG.regex.tableSeparator.test(line));
      
      const rows = dataRows.map(line => {
        const cells = line
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell);
        
        // Ensure row has same number of cells as header
        while (cells.length < headerCells.length) {
          cells.push('');
        }
        
        return cells;
      });

      return (
        <div className={FORMATTER_CONFIG.styles.table.wrapper}>
          <table className={FORMATTER_CONFIG.styles.table.table}>
            <thead>
              <tr className={FORMATTER_CONFIG.styles.table.headerRow}>
                {headerCells.map((header, index) => (
                  <th 
                    key={index}
                    className={FORMATTER_CONFIG.styles.table.headerCell}
                  >
                    {TextProcessor.processInlineFormatting(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.slice(0, headerCells.length).map((cell, cellIndex) => (
                    <td 
                      key={cellIndex}
                      className={FORMATTER_CONFIG.styles.table.cell}
                    >
                      {TextProcessor.processInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (error) {
      console.error('Error parsing table:', error);
      return <div className="text-red-500">Error rendering table</div>;
    }
  }

  // Numbered list detector with improved regex
  static hasNumberedList(text: string): boolean {
    if (!isValidString(text)) return false;
    return FORMATTER_CONFIG.regex.numberedList.test(text) || 
           FORMATTER_CONFIG.regex.numberedListWithBold.test(text);
  }

  // Improved numbered list parser with better error handling
  static parseNumberedList(text: string): React.ReactElement | null {
    if (!isValidString(text)) return null;

    try {
      const lines = text.split('\n');
      const listItems: ListItem[] = [];
      let currentItem: string | null = null;
      let currentNumber: string | null = null;
      
      lines.forEach((line) => {
        // Handle various numbered list formats
        let match: RegExpMatchArray | null = null;
        let content = '';
        
        // Pattern 1: "1. **1.**Content" (duplicated with bold)
        const duplicateMatch = line.match(FORMATTER_CONFIG.regex.numberedListWithBold);
        if (duplicateMatch) {
          match = duplicateMatch;
          content = duplicateMatch[2];
        } else {
          // Pattern 2: "1. Content" (standard)
          const standardMatch = line.match(FORMATTER_CONFIG.regex.numberedList);
          if (standardMatch) {
            match = standardMatch;
            content = standardMatch[2];
          }
        }
        
        if (match) {
          // Save previous item if exists
          if (currentItem !== null && currentNumber !== null) {
            listItems.push({
              number: currentNumber,
              content: currentItem.trim()
            });
          }
          // Start new item
          currentNumber = match[1];
          currentItem = content;
        } else if (currentItem !== null && line.trim()) {
          // Continue current item (multi-line support)
          if (line.trim().startsWith('-')) {
            currentItem += '\n' + line.trim();
          } else {
            currentItem += ' ' + line.trim();
          }
        } else if (!line.trim() && currentItem !== null && currentNumber !== null) {
          // Empty line ends current item
          listItems.push({
            number: currentNumber,
            content: currentItem.trim()
          });
          currentItem = null;
          currentNumber = null;
        }
      });
      
      if (listItems.length === 0) return null;
      
      return (
        <ol className={FORMATTER_CONFIG.styles.list.ordered}>
          {listItems.map((item, index) => (
            <li key={index} className={FORMATTER_CONFIG.styles.list.listItem}>
              <span className={FORMATTER_CONFIG.styles.list.number}>{item.number}.</span>
              <div className={FORMATTER_CONFIG.styles.list.content}>
                {item.content.includes('\n-') ? 
                  TextFormatterParsers.formatListItemWithSubItems(item.content) : 
                  TextProcessor.processInlineFormatting(item.content)
                }
              </div>
            </li>
          ))}
        </ol>
      );
    } catch (error) {
      console.error('Error parsing numbered list:', error);
      return <div className="text-red-500">Error rendering list</div>;
    }
  }

  // Helper to format list items with sub-items
  static formatListItemWithSubItems(content: string): React.ReactElement {
    const parts = content.split('\n');
    const mainContent = parts[0];
    const subItems = parts.slice(1).filter(line => line.trim().startsWith('-'));
    
    return (
      <>
        {TextProcessor.processInlineFormatting(mainContent)}
        {subItems.length > 0 && (
          <ul className={FORMATTER_CONFIG.styles.list.subList}>
            {subItems.map((subItem, index) => (
              <li key={index} className={FORMATTER_CONFIG.styles.list.subItem}>
                {TextProcessor.processInlineFormatting(subItem.replace(/^-\s*/, ''))}
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }
}

// Text processing logic with error handling
class TextProcessor {
  
  // Registry of formatting parsers with proper typing
  static formatters: ParserFunction[] = [
    TextFormatterParsers.parseHeader,
    TextFormatterParsers.parseEmailLink,
    TextFormatterParsers.parseRegularLink,
    TextFormatterParsers.parseBold,
    TextFormatterParsers.parseAutoURL
  ];

  // Process inline formatting with error handling
  static processInlineFormatting(text: string): React.ReactNode {
    if (!text || typeof text !== 'string') return text;
    
    try {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let key = 0;
      const maxIterations = 1000; // Prevent infinite loops
      let iterations = 0;

      while (remaining.length > 0 && iterations < maxIterations) {
        iterations++;
        let foundMatch = false;

        // Try each formatter until one matches
        for (const formatter of this.formatters) {
          const result = formatter(remaining, key++);
          
          if (result) {
            // Add text before match
            if (result.beforeMatch) {
              parts.push(<span key={key++}>{result.beforeMatch}</span>);
            }
            
            // Add formatted element
            parts.push(result.element);
            
            // Continue with remaining text
            remaining = result.afterMatch;
            foundMatch = true;
            break;
          }
        }

        // No formatter matched, add remaining text and break
        if (!foundMatch) {
          parts.push(<span key={key++}>{remaining}</span>);
          break;
        }
      }

      return parts.length > 0 ? parts : text;
    } catch (error) {
      console.error('Error processing inline formatting:', error);
      return <span>{text}</span>;
    }
  }

  // Fixed process mixed content with proper end-of-content handling
  static processMixedContent(text: string): React.ReactNode[] {
    if (!isValidString(text)) return [<span>{text}</span>];

    try {
      const lines = text.split('\n');
      const content: React.ReactNode[] = [];
      let currentTextBlock: string[] = [];
      let currentTableBlock: string[] = [];
      let currentListBlock: string[] = [];
      let inTable = false;
      let inList = false;
      let key = 0;

      // Helper function to flush blocks
      const flushTextBlock = () => {
        if (currentTextBlock.length > 0) {
          const textContent = currentTextBlock.join('\n').trim();
          if (textContent) {
            content.push(
              <div key={key++} className="prose prose-sm">
                {this.processInlineFormatting(textContent)}
              </div>
            );
          }
          currentTextBlock = [];
        }
      };

      const flushTableBlock = () => {
        if (currentTableBlock.length > 0) {
          content.push(
            <div key={key++}>
              {TextFormatterParsers.parseMarkdownTable(currentTableBlock.join('\n'))}
            </div>
          );
          currentTableBlock = [];
          inTable = false;
        }
      };

      const flushListBlock = () => {
        if (currentListBlock.length > 0) {
          const listElement = TextFormatterParsers.parseNumberedList(currentListBlock.join('\n'));
          if (listElement) {
            content.push(<div key={key++}>{listElement}</div>);
          }
          currentListBlock = [];
          inList = false;
        }
      };

      lines.forEach((line, index) => {
        const isTableLine = line.includes('|') && line.trim();
        const isListLine = FORMATTER_CONFIG.regex.numberedList.test(line) || 
                          FORMATTER_CONFIG.regex.numberedListWithBold.test(line);
        const isEmptyLine = !line.trim();
        const isLastLine = index === lines.length - 1;

        // Handle table lines
        if (isTableLine) {
          if (inList) flushListBlock();
          if (!inTable) flushTextBlock();
          inTable = true;
          currentTableBlock.push(line);
        }
        // Handle list lines
        else if (isListLine || (inList && !isEmptyLine)) {
          if (inTable) flushTableBlock();
          if (!inList) flushTextBlock();
          inList = true;
          currentListBlock.push(line);
        }
        // Handle regular text
        else {
          if (inTable) flushTableBlock();
          if (inList && (isEmptyLine || isLastLine)) {
            flushListBlock();
          }
          
          if (!isEmptyLine || currentTextBlock.length > 0) {
            currentTextBlock.push(line);
          }
        }

        // Handle last line
        if (isLastLine) {
          if (inTable) flushTableBlock();
          if (inList) flushListBlock();
          flushTextBlock();
        }
      });

      return content.length > 0 ? content : [<span>{text}</span>];
    } catch (error) {
      console.error('Error processing mixed content:', error);
      return [<div className="text-red-500">Error processing content</div>];
    }
  }
}

// Main renderer with error handling
class TextFormatterRenderer {
  
  // Process text sections with error handling
  static processSections(text: string): React.ReactNode[] {
    if (!isValidString(text)) return [];

    try {
      const sections = text.split('***').filter(section => section.trim());
      
      return sections.map((section, sectionIndex) => {
        const trimmedSection = section.trim();
        
        // Check if section contains special content
        if (TextFormatterParsers.isTable(trimmedSection) || 
            TextFormatterParsers.hasNumberedList(trimmedSection)) {
          // Handle mixed content
          const mixedContent = TextProcessor.processMixedContent(trimmedSection);
          return (
            <div 
              key={sectionIndex} 
              className="space-y-3"
            >
              {mixedContent}
            </div>
          );
        }

        // Process regular formatted section
        const formattedSection = TextProcessor.processInlineFormatting(trimmedSection);
        
        return (
          <div 
            key={sectionIndex} 
            className=""
          >
            {formattedSection}
          </div>
        );
      });
    } catch (error) {
      console.error('Error processing sections:', error);
      return [<div className="text-red-500">Error rendering content</div>];
    }
  }
}

// Props interface with optional error handler
interface TextFormatterProps {
  text: string;
  className?: string;
  onError?: (error: Error) => void;
}

// Main component with error boundary behavior
const TextFormatter: React.FC<TextFormatterProps> = ({ 
  text, 
  className = "",
  onError 
}) => {
  if (!text) return null;

  try {
    const sections = TextFormatterRenderer.processSections(text);
    
    return (
      <span className={`formatted-text ${className}`}>
        {sections}
      </span>
    );
  } catch (error) {
    console.error('TextFormatter error:', error);
    
    if (onError && error instanceof Error) {
      onError(error);
    }
    
    // Fallback to plain text
    return (
      <span className={className}>
        {text}
      </span>
    );
  }
};

export default TextFormatter;