import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 })
    }

    // 读取文件内容
    const buffer = await file.arrayBuffer()
    const content = new TextDecoder().decode(buffer)

    // 根据文件类型处理内容
    let processedContent = content
    if (file.name.endsWith('.pdf')) {
      // 这里可以集成PDF解析库，暂时返回提示
      processedContent = '已上传PDF文件，内容解析功能开发中...'
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileType: type,
      content: processedContent,
      size: file.size
    })
  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json({ error: '文件上传失败' }, { status: 500 })
  }
}
