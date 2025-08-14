import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, readFile } from 'fs/promises'
import { join, extname } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// 支持的压缩格式
const SUPPORTED_FORMATS = ['.zip', '.rar', '.tar', '.tar.gz', '.7z']

// 代码文件扩展名
const CODE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
  '.html', '.css', '.scss', '.sass', '.vue', '.php', '.rb', '.go',
  '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml', '.fs',
  '.sql', '.sh', '.bat', '.ps1', '.yaml', '.yml', '.json', '.xml',
  '.md', '.txt', '.rst', '.tex', '.r', '.m', '.pl', '.lua'
]

// 忽略的文件和目录
const IGNORE_PATTERNS = [
  'node_modules', '.git', '.svn', '.hg', '__pycache__', '.pytest_cache',
  '__MACOSX', '._', '.DS_Store', 'Thumbs.db', '.idea', '.vscode', 
  'dist', 'build', 'coverage', '.nyc_output', '.next', '.nuxt', '.output'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 检查文件格式
    const fileName = file.name.toLowerCase()
    const fileExtension = extname(fileName)
    
    if (!SUPPORTED_FORMATS.some(format => fileName.endsWith(format))) {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      )
    }

    // 创建临时目录
    const tempDir = join(process.cwd(), 'temp', `project-${Date.now()}`)
    await mkdir(tempDir, { recursive: true })
    
    // 保存上传的文件
    const filePath = join(tempDir, file.name)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    let extractedFiles: Array<{ name: string; content: string; size: number; type: string }> = []

    try {
      // 根据文件格式解压
      if (fileName.endsWith('.zip')) {
        extractedFiles = await extractZip(filePath, tempDir)
      } else if (fileName.endsWith('.tar.gz') || fileName.endsWith('.tgz')) {
        extractedFiles = await extractTarGz(filePath, tempDir)
      } else if (fileName.endsWith('.tar')) {
        extractedFiles = await extractTar(filePath, tempDir)
      } else if (fileName.endsWith('.rar')) {
        extractedFiles = await extractRar(filePath, tempDir)
      } else if (fileName.endsWith('.7z')) {
        extractedFiles = await extract7z(filePath, tempDir)
      }

      // 过滤和读取代码文件
      const codeFiles = await filterAndReadCodeFiles(extractedFiles, tempDir)

      return NextResponse.json({
        success: true,
        files: codeFiles,
        totalFiles: extractedFiles.length,
        codeFiles: codeFiles.length
      })

    } finally {
      // 清理临时文件
      try {
        await cleanupTempFiles(tempDir)
      } catch (error) {
        console.error('Failed to cleanup temp files:', error)
      }
    }

  } catch (error) {
    console.error('Upload project error:', error)
    return NextResponse.json(
      { error: 'Failed to process project file' },
      { status: 500 }
    )
  }
}

// 解压ZIP文件
async function extractZip(filePath: string, extractDir: string) {
  try {
    // 使用unzip命令解压
    await execAsync(`unzip -q "${filePath}" -d "${extractDir}"`)
    return await scanDirectory(extractDir)
  } catch (error) {
    console.error('Failed to extract ZIP:', error)
    throw new Error('Failed to extract ZIP file')
  }
}

// 解压TAR.GZ文件
async function extractTarGz(filePath: string, extractDir: string) {
  try {
    await execAsync(`tar -xzf "${filePath}" -C "${extractDir}"`)
    return await scanDirectory(extractDir)
  } catch (error) {
    console.error('Failed to extract TAR.GZ:', error)
    throw new Error('Failed to extract TAR.GZ file')
  }
}

// 解压TAR文件
async function extractTar(filePath: string, extractDir: string) {
  try {
    await execAsync(`tar -xf "${filePath}" -C "${extractDir}"`)
    return await scanDirectory(extractDir)
  } catch (error) {
    console.error('Failed to extract TAR:', error)
    throw new Error('Failed to extract TAR file')
  }
}

// 解压RAR文件
async function extractRar(filePath: string, extractDir: string) {
  try {
    await execAsync(`unrar x -y "${filePath}" "${extractDir}"`)
    return await scanDirectory(extractDir)
  } catch (error) {
    console.error('Failed to extract RAR:', error)
    throw new Error('Failed to extract RAR file')
  }
}

// 解压7Z文件
async function extract7z(filePath: string, extractDir: string) {
  try {
    await execAsync(`7z x -y "${filePath}" -o"${extractDir}"`)
    return await scanDirectory(extractDir)
  } catch (error) {
    console.error('Failed to extract 7Z:', error)
    throw new Error('Failed to extract 7Z file')
  }
}

// 扫描目录获取所有文件
async function scanDirectory(dir: string, baseDir: string = dir): Promise<Array<{ name: string; content: string; size: number; type: string }>> {
  const files: Array<{ name: string; content: string; size: number; type: string }> = []
  
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      const relativePath = fullPath.replace(baseDir, '').replace(/^[\/\\]/, '')
      
      // 跳过忽略的目录和文件
      if (IGNORE_PATTERNS.some(pattern => relativePath.includes(pattern))) {
        continue
      }
      
      // 额外检查：跳过 __MACOSX 目录及其所有内容
      if (entry.name === '__MACOSX' || relativePath.includes('__MACOSX/')) {
        continue
      }
      
      // 跳过以 ._ 开头的文件（macOS 元数据文件）
      if (entry.name.startsWith('._')) {
        continue
      }
      
      if (entry.isDirectory()) {
        // 递归扫描子目录
        const subFiles = await scanDirectory(fullPath, baseDir)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        // 检查是否为代码文件
        const ext = extname(entry.name).toLowerCase()
        if (CODE_EXTENSIONS.includes(ext)) {
          try {
            const content = await readFile(fullPath, 'utf-8')
            const stats = await readFile(fullPath)
            
            // 只添加非空且有意义的代码文件
            if (content && content.trim().length > 0 && content.trim().length > 10) { // 至少10个字符
              files.push({
                name: relativePath,
                content,
                size: stats.length,
                type: ext.substring(1) // 去掉点号
              })
            }
          } catch (error) {
            console.warn(`Failed to read file ${fullPath}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to scan directory:', error)
  }
  
  return files
}

// 过滤和读取代码文件
async function filterAndReadCodeFiles(files: Array<{ name: string; content: string; size: number; type: string }>, baseDir: string) {
  const codeFiles: Array<{ name: string; content: string; size: number; type: string }> = []
  
  for (const file of files) {
    const ext = extname(file.name).toLowerCase()
    if (CODE_EXTENSIONS.includes(ext)) {
      // 限制文件大小（避免过大的文件）
      if (file.size <= 1024 * 1024 && // 1MB限制
          file.content && 
          file.content.trim().length > 10 && // 至少10个字符
          !file.content.trim().match(/^\s*$/) && // 不是纯空白文件
          !file.content.trim().match(/^\/\*[\s\S]*\*\/\s*$/) && // 不是只有注释的文件
          !file.content.trim().match(/^\/\/.*$/)) { // 不是只有单行注释的文件
        
        codeFiles.push(file)
      }
    }
  }
  
  return codeFiles
}

// 清理临时文件
async function cleanupTempFiles(dir: string) {
  try {
    await execAsync(`rm -rf "${dir}"`)
  } catch (error) {
    console.error('Failed to cleanup temp files:', error)
  }
}
