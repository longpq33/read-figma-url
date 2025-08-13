const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Tăng giới hạn lên 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // Tăng giới hạn cho URL encoded
app.use(express.static('public'));

// Error handling middleware for payload too large
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      error: 'Request body quá lớn hoặc không hợp lệ',
      details: 'Vui lòng thử lại với ít components hơn'
    });
  }
  next(err);
});

// Figma API configuration
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API_BASE = 'https://api.figma.com/v1';

// Utility functions
function extractFileKey(figmaUrl) {
  // Support multiple Figma URL formats
  const patterns = [
    /figma\.com\/file\/([a-zA-Z0-9]+)/,           // Standard file URL
    /figma\.com\/design\/([a-zA-Z0-9]+)/,         // Design URL
    /figma\.com\/proto\/([a-zA-Z0-9]+)/,          // Prototype URL
    /figma\.com\/embed\/([a-zA-Z0-9]+)/           // Embed URL
  ];
  
  for (const pattern of patterns) {
    const match = figmaUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

function generateComponentCode(node, nodeName) {
  const componentName = nodeName.charAt(0).toUpperCase() + nodeName.slice(1);
  
  let jsx = `import React from 'react';\n\n`;
  jsx += `const ${componentName} = ({ className = '', ...props }) => {\n`;
  jsx += `  return (\n`;
  
  // Tạo component dựa trên loại node
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    jsx += `    <div className={\`${componentName.toLowerCase()} \${className}\`} {...props}>\n`;
    jsx += generateChildrenCode(node.children || [], 2);
    jsx += `    </div>\n`;
  } else if (node.type === 'TEXT') {
    jsx += generateTextCode(node, componentName, 2);
  } else if (node.type === 'RECTANGLE') {
    jsx += generateRectangleCode(node, componentName, 2);
  } else if (node.type === 'ELLIPSE') {
    jsx += generateEllipseCode(node, componentName, 2);
  } else if (node.type === 'VECTOR') {
    jsx += generateVectorCode(node, componentName, 2);
  } else if (node.type === 'INSTANCE' || node.type === 'COMPONENT') {
    jsx += `    <div className={\`${componentName.toLowerCase()} \${className}\`} {...props}>\n`;
    jsx += generateChildrenCode(node.children || [], 2);
    jsx += `    </div>\n`;
  } else if (node.type === 'TABLE') {
    jsx += generateTableCode(node, componentName, 2);
  } else {
    // Fallback cho các loại node khác
    jsx += `    <div className={\`${componentName.toLowerCase()} \${className}\`} {...props}>\n`;
    jsx += `      <div className="component-content">\n`;
    jsx += `        <h3>${componentName}</h3>\n`;
    jsx += `        <p>Type: ${node.type}</p>\n`;
    if (node.children && node.children.length > 0) {
      jsx += generateChildrenCode(node.children, 4);
    }
    jsx += `      </div>\n`;
    jsx += `    </div>\n`;
  }
  
  jsx += `  );\n`;
  jsx += `};\n\n`;
  jsx += `export default ${componentName};\n`;
  
  return jsx;
}

function generateChildrenCode(children, indent = 2) {
  if (!children || children.length === 0) return '';
  
  let code = '';
  children.forEach(child => {
    const spaces = ' '.repeat(indent);
    
    if (child.type === 'TEXT') {
      code += generateTextCode(child, child.name || 'Text', indent);
    } else if (child.type === 'RECTANGLE') {
      code += generateRectangleCode(child, child.name || 'Rectangle', indent);
    } else if (child.type === 'ELLIPSE') {
      code += generateEllipseCode(child, child.name || 'Ellipse', indent);
    } else if (child.type === 'VECTOR') {
      code += generateVectorCode(child, child.name || 'Vector', indent);
    } else if (child.type === 'FRAME' || child.type === 'GROUP') {
      code += `${spaces}<div className="${child.name?.toLowerCase() || 'frame'}" style={{\n`;
      code += generateStyleCode(child, indent + 2);
      code += `${spaces}}}>\n`;
      if (child.children && child.children.length > 0) {
        code += generateChildrenCode(child.children, indent + 2);
      }
      code += `${spaces}</div>\n`;
    } else if (child.type === 'INSTANCE' || child.type === 'COMPONENT') {
      code += `${spaces}<div className="${child.name?.toLowerCase() || 'component'}" style={{\n`;
      code += generateStyleCode(child, indent + 2);
      code += `${spaces}}}>\n`;
      if (child.children && child.children.length > 0) {
        code += generateChildrenCode(child.children, indent + 2);
      }
      code += `${spaces}</div>\n`;
    } else if (child.type === 'TABLE') {
      code += generateTableCode(child, child.name || 'Table', indent);
    } else {
      // Fallback cho các loại node khác
      code += `${spaces}<div className="${child.name?.toLowerCase() || 'element'}" style={{\n`;
      code += generateStyleCode(child, indent + 2);
      code += `${spaces}}}>\n`;
      if (child.children && child.children.length > 0) {
        code += generateChildrenCode(child.children, indent + 2);
      }
      code += `${spaces}</div>\n`;
    }
  });
  
  return code;
}

function generateTextCode(node, name, indent = 2) {
  const spaces = ' '.repeat(indent);
  const text = node.characters || name || 'Text';
  const style = node.style || {};
  
  let code = `${spaces}<p className="${name.toLowerCase()}" style={{\n`;
  code += generateTextStyleCode(style, indent + 2);
  code += `${spaces}}}>${text}</p>\n`;
  
  return code;
}

function generateRectangleCode(node, name, indent = 2) {
  const spaces = ' '.repeat(indent);
  const bbox = node.absoluteBoundingBox || {};
  const fills = node.fills || [];
  
  let code = `${spaces}<div className="${name.toLowerCase()}" style={{\n`;
  code += generateStyleCode(node, indent + 2);
  code += `${spaces}}}></div>\n`;
  
  return code;
}

function generateEllipseCode(node, name, indent = 2) {
  const spaces = ' '.repeat(indent);
  
  let code = `${spaces}<div className="${name.toLowerCase()}" style={{\n`;
  code += generateStyleCode(node, indent + 2);
  code += `${spaces}, borderRadius: '50%'}}></div>\n`;
  
  return code;
}

function generateVectorCode(node, name, indent = 2) {
  const spaces = ' '.repeat(indent);
  
  let code = `${spaces}<div className="${name.toLowerCase()}" style={{\n`;
  code += generateStyleCode(node, indent + 2);
  code += `${spaces}}}></div>\n`;
  
  return code;
}

function generateTableCode(node, name, indent = 2) {
  const spaces = ' '.repeat(indent);
  const children = node.children || [];
  
  let code = `${spaces}<div className="${name.toLowerCase()}-table" style={{\n`;
  code += generateStyleCode(node, indent + 2);
  code += `${spaces}}}>\n`;
  
  // Tìm các row và column
  const rows = children.filter(child => child.name?.toLowerCase().includes('row'));
  const columns = children.filter(child => child.name?.toLowerCase().includes('col') || child.name?.toLowerCase().includes('header'));
  
  if (rows.length > 0) {
    code += `${spaces}  <table style={{ width: '100%', borderCollapse: 'collapse' }}>\n`;
    
    // Generate table headers
    if (columns.length > 0) {
      code += `${spaces}    <thead>\n`;
      code += `${spaces}      <tr>\n`;
      columns.forEach(col => {
        code += `${spaces}        <th style={{ padding: '8px', border: '1px solid #ddd' }}>${col.name || 'Header'}</th>\n`;
      });
      code += `${spaces}      </tr>\n`;
      code += `${spaces}    </thead>\n`;
    }
    
    // Generate table body
    code += `${spaces}    <tbody>\n`;
    rows.forEach((row, rowIndex) => {
      code += `${spaces}      <tr>\n`;
      if (row.children && row.children.length > 0) {
        row.children.forEach(cell => {
          if (cell.type === 'TEXT') {
            code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>${cell.characters || 'Cell'}</td>\n`;
          } else {
            code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>${cell.name || 'Cell'}</td>\n`;
          }
        });
      } else {
        // Fallback cells
        const cellCount = columns.length || 3;
        for (let i = 0; i < cellCount; i++) {
          code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Row ${rowIndex + 1} Cell ${i + 1}</td>\n`;
        }
      }
      code += `${spaces}      </tr>\n`;
    });
    code += `${spaces}    </tbody>\n`;
    code += `${spaces}  </table>\n`;
  } else {
    // Fallback table
    code += `${spaces}  <table style={{ width: '100%', borderCollapse: 'collapse' }}>\n`;
    code += `${spaces}    <thead>\n`;
    code += `${spaces}      <tr>\n`;
    code += `${spaces}        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Column 1</th>\n`;
    code += `${spaces}        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Column 2</th>\n`;
    code += `${spaces}        <th style={{ padding: '8px', border: '1px solid #ddd' }}>Column 3</th>\n`;
    code += `${spaces}      </tr>\n`;
    code += `${spaces}    </thead>\n`;
    code += `${spaces}    <tbody>\n`;
    code += `${spaces}      <tr>\n`;
    code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Data 1</td>\n`;
    code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Data 2</td>\n`;
    code += `${spaces}        <td style={{ padding: '8px', border: '1px solid #ddd' }}>Data 3</td>\n`;
    code += `${spaces}      </tr>\n`;
    code += `${spaces}    </tbody>\n`;
    code += `${spaces}  </table>\n`;
  }
  
  code += `${spaces}</div>\n`;
  return code;
}

function generateStyleCode(node, indent = 2) {
  const spaces = ' '.repeat(indent);
  const bbox = node.absoluteBoundingBox || {};
  const fills = node.fills || [];
  const strokes = node.strokes || [];
  const effects = node.effects || [];
  
  let style = '';
  
  // Kích thước
  if (bbox.width) style += `${spaces}width: '${bbox.width}px',\n`;
  if (bbox.height) style += `${spaces}height: '${bbox.height}px',\n`;
  
  // Background color
  if (fills.length > 0 && fills[0].type === 'SOLID' && fills[0].color) {
    const color = fills[0].color;
    const rgb = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
    style += `${spaces}backgroundColor: '${rgb}',\n`;
  }
  
  // Border
  if (strokes.length > 0 && strokes[0].type === 'SOLID' && strokes[0].color) {
    const color = strokes[0].color;
    const rgb = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
    style += `${spaces}border: '1px solid ${rgb}',\n`;
  }
  
  // Border radius
  if (node.cornerRadius) {
    style += `${spaces}borderRadius: '${node.cornerRadius}px',\n`;
  }
  
  // Effects (shadows)
  if (effects.length > 0) {
    effects.forEach(effect => {
      if (effect.type === 'DROP_SHADOW') {
        style += `${spaces}boxShadow: '${effect.offset.x}px ${effect.offset.y}px ${effect.radius}px rgba(0,0,0,${effect.opacity || 0.3})',\n`;
      }
    });
  }
  
  // Layout properties
  if (node.layoutMode) {
    style += `${spaces}display: 'flex',\n`;
    if (node.layoutMode === 'HORIZONTAL') {
      style += `${spaces}flexDirection: 'row',\n`;
    } else if (node.layoutMode === 'VERTICAL') {
      style += `${spaces}flexDirection: 'column',\n`;
    }
  }
  
  // Padding
  if (node.paddingLeft) style += `${spaces}paddingLeft: '${node.paddingLeft}px',\n`;
  if (node.paddingRight) style += `${spaces}paddingRight: '${node.paddingRight}px',\n`;
  if (node.paddingTop) style += `${spaces}paddingTop: '${node.paddingTop}px',\n`;
  if (node.paddingBottom) style += `${spaces}paddingBottom: '${node.paddingBottom}px',\n`;
  
  // Spacing
  if (node.itemSpacing) style += `${spaces}gap: '${node.itemSpacing}px',\n`;
  
  return style;
}

function generateTextStyleCode(style, indent = 2) {
  const spaces = ' '.repeat(indent);
  let textStyle = '';
  
  if (style.fontFamily) textStyle += `${spaces}fontFamily: '${style.fontFamily}',\n`;
  if (style.fontSize) textStyle += `${spaces}fontSize: '${style.fontSize}px',\n`;
  if (style.fontWeight) textStyle += `${spaces}fontWeight: ${style.fontWeight},\n`;
  if (style.fontStyle) textStyle += `${spaces}fontStyle: '${style.fontStyle}',\n`;
  if (style.textAlignHorizontal) textStyle += `${spaces}textAlign: '${style.textAlignHorizontal.toLowerCase()}',\n`;
  if (style.letterSpacing) textStyle += `${spaces}letterSpacing: '${style.letterSpacing}px',\n`;
  if (style.lineHeightPx) textStyle += `${spaces}lineHeight: '${style.lineHeightPx}px',\n`;
  
  return textStyle;
}

function generateSimpleComponent(componentName, componentType) {
  const name = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  let jsx = `import React from 'react';\n\n`;
  jsx += `const ${name} = ({ className = '', ...props }) => {\n`;
  jsx += `  return (\n`;
  jsx += `    <div className={\`${name.toLowerCase()} \${className}\`} {...props}>\n`;
  jsx += `      <div className="component-placeholder">\n`;
  jsx += `        <h3>${name}</h3>\n`;
  jsx += `        <p>Component type: ${componentType}</p>\n`;
  jsx += `        <p>Generated from Figma design</p>\n`;
  jsx += `      </div>\n`;
  jsx += `    </div>\n`;
  jsx += `  );\n`;
  jsx += `};\n\n`;
  jsx += `export default ${name};\n`;
  
  return jsx;
}

// API Routes
app.post('/api/figma/parse', async (req, res) => {
  try {
    const { figmaUrl } = req.body;
    
    if (!figmaUrl) {
      return res.status(400).json({ error: 'Figma URL là bắt buộc' });
    }
    
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma Access Token chưa được cấu hình' });
    }
    
    const fileKey = extractFileKey(figmaUrl);
    if (!fileKey) {
      return res.status(400).json({ error: 'URL Figma không hợp lệ' });
    }
    
    // Get Figma file data
    const response = await axios.get(`${FIGMA_API_BASE}/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN
      }
    });
    
    const figmaData = response.data;
    const components = [];
    
    // Extract components from Figma data
    if (figmaData.document && figmaData.document.children) {
      figmaData.document.children.forEach(page => {
        if (page.children) {
          page.children.forEach(node => {
            if (node.type === 'COMPONENT' || node.type === 'INSTANCE') {
              components.push({
                id: node.id,
                name: node.name,
                type: node.type,
                // Giữ lại toàn bộ thông tin cần thiết để generate component
                node: {
                  type: node.type,
                  name: node.name,
                  children: node.children || [],
                  style: node.style,
                  fills: node.fills || [],
                  strokes: node.strokes || [],
                  effects: node.effects || [],
                  absoluteBoundingBox: node.absoluteBoundingBox,
                  cornerRadius: node.cornerRadius,
                  layoutMode: node.layoutMode,
                  paddingLeft: node.paddingLeft,
                  paddingRight: node.paddingRight,
                  paddingTop: node.paddingTop,
                  paddingBottom: node.paddingBottom,
                  itemSpacing: node.itemSpacing,
                  characters: node.characters,
                  // Giữ lại thông tin text style
                  textStyle: node.style,
                  // Giữ lại thông tin layout
                  constraints: node.constraints,
                  layoutAlign: node.layoutAlign,
                  layoutGrow: node.layoutGrow
                }
              });
            }
          });
        }
      });
    }
    
    res.json({
      success: true,
      fileKey,
      fileName: figmaData.name,
      components,
      pages: figmaData.document.children.map(page => ({
        id: page.id,
        name: page.name,
        type: page.type
      }))
    });
    
  } catch (error) {
    console.error('Error parsing Figma:', error);
    res.status(500).json({ 
      error: 'Lỗi khi parse Figma file',
      details: error.message 
    });
  }
});

app.post('/api/figma/generate', async (req, res) => {
  try {
    const { components, outputPath = 'generated-components' } = req.body;
    
    if (!components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'Components array là bắt buộc' });
    }
    
    // Validate components array size
    if (components.length > 100) {
      return res.status(400).json({ 
        error: 'Quá nhiều components', 
        details: 'Vui lòng chọn ít hơn 100 components để tránh lỗi' 
      });
    }
    
    // Create output directory
    const outputDir = path.join(__dirname, outputPath);
    await fs.ensureDir(outputDir);
    
    const generatedFiles = [];
    
    // Generate component files
    for (const component of components) {
      const fileName = `${component.name}.jsx`;
      const filePath = path.join(outputDir, fileName);
      
      // Tạo component code đơn giản nếu không có node data
      let componentCode;
      if (component.node) {
        componentCode = generateComponentCode(component.node, component.name);
      } else {
        // Fallback: tạo component đơn giản
        componentCode = generateSimpleComponent(component.name, component.type);
      }
      
      await fs.writeFile(filePath, componentCode, 'utf8');
      generatedFiles.push({
        name: component.name,
        fileName,
        path: filePath,
        code: componentCode
      });
    }
    
    // Generate index file
    const indexContent = generatedFiles.map(file => 
      `export { default as ${file.name} } from './${file.fileName.replace('.jsx', '')}';`
    ).join('\n');
    
    const indexPath = path.join(outputDir, 'index.js');
    await fs.writeFile(indexPath, indexContent, 'utf8');
    
    res.json({
      success: true,
      message: `Đã tạo ${generatedFiles.length} components thành công`,
      generatedFiles: generatedFiles,
      outputPath: outputDir
    });
    
  } catch (error) {
    console.error('Error generating components:', error);
    res.status(500).json({ 
      error: 'Lỗi khi tạo components',
      details: error.message 
    });
  }
});

app.get('/api/figma/components', (req, res) => {
  res.json({
    message: 'API endpoint để lấy danh sách components',
    usage: 'Sử dụng POST /api/figma/parse để parse Figma file trước'
  });
});

// Test Figma API connection
app.get('/api/figma/test', async (req, res) => {
  try {
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma Access Token chưa được cấu hình' });
    }

    // Test with a simple Figma API call to check token validity
    const response = await axios.get(`${FIGMA_API_BASE}/me`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN
      }
    });

    res.json({
      success: true,
      message: 'Figma API kết nối thành công',
      userData: {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name
      }
    });

  } catch (error) {
    console.error('Error testing Figma API:', error);
    
    if (error.response) {
      res.status(error.response.status).json({ 
        error: 'Lỗi kết nối Figma API',
        status: error.response.status,
        details: error.response.data || error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Lỗi kết nối Figma API',
        details: error.message 
      });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server đang hoạt động',
    figmaToken: FIGMA_ACCESS_TOKEN ? 'Đã cấu hình' : 'Chưa cấu hình'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📱 Frontend sẽ chạy tại http://localhost:3000`);
  console.log(`🔑 Figma Token: ${FIGMA_ACCESS_TOKEN ? 'Đã cấu hình' : 'Chưa cấu hình'}`);
});
