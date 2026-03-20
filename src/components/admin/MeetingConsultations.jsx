import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import AdminNavigation from './AdminNavigation'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../ui/table'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Download,
  FileSpreadsheet,
  ChevronDown,
  ExternalLink,
  CalendarDays,
  UserPlus,
  Paperclip,
  FileText,
  Upload,
} from 'lucide-react'

// 상태 뱃지 컴포넌트
const StatusBadge = ({ status, type }) => {
  const configs = {
    contact: {
      not_contacted: { label: '미연락', bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock },
      contacted: { label: '연락완료', bg: 'bg-blue-100', text: 'text-blue-700', icon: Phone },
      responded: { label: '응답받음', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      no_response: { label: '무응답', bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    },
    meeting: {
      pending: { label: '대기', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      scheduled: { label: '예정', bg: 'bg-blue-100', text: 'text-blue-700', icon: CalendarDays },
      completed: { label: '완료', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      cancelled: { label: '취소', bg: 'bg-red-100', text: 'text-red-700', icon: X },
      no_show: { label: '불참', bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle },
    },
    response: {
      waiting: { label: '대기중', bg: 'bg-gray-100', text: 'text-gray-600', icon: Clock },
      accepted: { label: '수락', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      declined: { label: '거절', bg: 'bg-red-100', text: 'text-red-700', icon: X },
      pending: { label: '보류', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    },
    priority: {
      low: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
      normal: { label: 'Normal', bg: 'bg-blue-100', text: 'text-blue-600' },
      high: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-700' },
      urgent: { label: 'Urgent', bg: 'bg-red-100', text: 'text-red-700' },
    },
  }

  const config = configs[type]?.[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  )
}

// 인라인 편집 셀
const EditableCell = ({ value, onSave, type = 'text', options = [] }) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')

  const handleSave = () => {
    onSave(editValue)
    setEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && type !== 'textarea') handleSave()
    if (e.key === 'Escape') { setEditValue(value || ''); setEditing(false) }
  }

  if (!editing) {
    return (
      <div
        className="cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 min-h-[24px] group"
        onClick={() => setEditing(true)}
      >
        <span className="text-sm">{value || <span className="text-gray-300">-</span>}</span>
      </div>
    )
  }

  if (type === 'select') {
    return (
      <select
        className="text-sm border border-blue-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
        value={editValue}
        onChange={(e) => { onSave(e.target.value); setEditing(false) }}
        onBlur={() => setEditing(false)}
        autoFocus
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }

  if (type === 'textarea') {
    return (
      <div className="flex flex-col gap-1">
        <textarea
          className="text-sm border border-blue-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[60px]"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <div className="flex gap-1">
          <button onClick={handleSave} className="text-xs text-white bg-blue-500 rounded px-2 py-0.5 hover:bg-blue-600"><Save className="w-3 h-3" /></button>
          <button onClick={() => { setEditValue(value || ''); setEditing(false) }} className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 hover:bg-gray-200"><X className="w-3 h-3" /></button>
        </div>
      </div>
    )
  }

  if (type === 'date') {
    return (
      <input
        type="datetime-local"
        className="text-sm border border-blue-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
        value={editValue ? new Date(editValue).toISOString().slice(0, 16) : ''}
        onChange={(e) => { onSave(e.target.value ? new Date(e.target.value).toISOString() : null); setEditing(false) }}
        onBlur={() => setEditing(false)}
        autoFocus
      />
    )
  }

  return (
    <input
      type={type}
      className="text-sm border border-blue-300 rounded px-1 py-0.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleSave}
      autoFocus
    />
  )
}

const MeetingConsultations = () => {
  const [sheets, setSheets] = useState([])
  const [activeSheetId, setActiveSheetId] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterContact, setFilterContact] = useState('all')
  const [filterMeeting, setFilterMeeting] = useState('all')
  const [showNewSheet, setShowNewSheet] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [editingSheetId, setEditingSheetId] = useState(null)
  const [editingSheetName, setEditingSheetName] = useState('')
  const [showAddRow, setShowAddRow] = useState(false)
  const [newRow, setNewRow] = useState({
    creator_name: '', creator_email: '', creator_phone: '',
    instagram_handle: '', tiktok_handle: '', youtube_handle: '',
    meeting_type: 'online', program_interest: '', source: '', priority: 'normal',
  })

  // 시트 목록 로드
  const loadSheets = useCallback(async () => {
    const { data, error } = await supabase
      .from('consultation_sheets')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    if (!error && data) {
      setSheets(data)
      if (!activeSheetId && data.length > 0) {
        setActiveSheetId(data[0].id)
      }
    }
  }, [activeSheetId])

  // 상담 데이터 로드
  const loadConsultations = useCallback(async () => {
    if (!activeSheetId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('meeting_consultations')
      .select('*')
      .eq('sheet_id', activeSheetId)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setConsultations(data)
    }
    setLoading(false)
  }, [activeSheetId])

  useEffect(() => { loadSheets() }, [])
  useEffect(() => { if (activeSheetId) loadConsultations() }, [activeSheetId, loadConsultations])

  // 새 시트 생성
  const createSheet = async () => {
    if (!newSheetName.trim()) return
    const { data, error } = await supabase
      .from('consultation_sheets')
      .insert([{ name: newSheetName.trim(), sort_order: sheets.length }])
      .select()
      .single()
    if (!error && data) {
      setSheets(prev => [...prev, data])
      setActiveSheetId(data.id)
      setNewSheetName('')
      setShowNewSheet(false)
    }
  }

  // 시트 이름 수정
  const updateSheetName = async (sheetId) => {
    if (!editingSheetName.trim()) return
    const { error } = await supabase
      .from('consultation_sheets')
      .update({ name: editingSheetName.trim(), updated_at: new Date().toISOString() })
      .eq('id', sheetId)
    if (!error) {
      setSheets(prev => prev.map(s => s.id === sheetId ? { ...s, name: editingSheetName.trim() } : s))
      setEditingSheetId(null)
    }
  }

  // 시트 삭제
  const deleteSheet = async (sheetId) => {
    if (!confirm('이 시트를 삭제하시겠습니까? 시트 내 데이터도 모두 삭제됩니다.')) return
    await supabase.from('meeting_consultations').delete().eq('sheet_id', sheetId)
    const { error } = await supabase.from('consultation_sheets').delete().eq('id', sheetId)
    if (!error) {
      const remaining = sheets.filter(s => s.id !== sheetId)
      setSheets(remaining)
      if (activeSheetId === sheetId) {
        setActiveSheetId(remaining.length > 0 ? remaining[0].id : null)
      }
    }
  }

  // 새 행 추가
  const addRow = async () => {
    if (!newRow.creator_name.trim()) return
    const { data, error } = await supabase
      .from('meeting_consultations')
      .insert([{ ...newRow, sheet_id: activeSheetId }])
      .select()
      .single()
    if (!error && data) {
      setConsultations(prev => [data, ...prev])
      setNewRow({
        creator_name: '', creator_email: '', creator_phone: '',
        instagram_handle: '', tiktok_handle: '', youtube_handle: '',
        meeting_type: 'online', program_interest: '', source: '', priority: 'normal',
      })
      setShowAddRow(false)
    }
  }

  // 셀 업데이트
  const updateCell = async (id, field, value) => {
    const updateData = { [field]: value, updated_at: new Date().toISOString() }
    // 연락 상태 변경 시 연락 날짜 자동 기록
    if (field === 'contact_status' && value !== 'not_contacted') {
      updateData.contact_date = new Date().toISOString()
    }
    if (field === 'response_status' && value !== 'waiting') {
      updateData.response_date = new Date().toISOString()
    }

    const { error } = await supabase
      .from('meeting_consultations')
      .update(updateData)
      .eq('id', id)
    if (!error) {
      setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...updateData } : c))
    }
  }

  // 행 삭제
  const deleteRow = async (id) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('meeting_consultations').delete().eq('id', id)
    if (!error) {
      setConsultations(prev => prev.filter(c => c.id !== id))
    }
  }

  // 회의록 파일 업로드 (Word 파일)
  const uploadMeetingMinutes = async (id, file) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${id}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('meeting-minutes')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })
    if (error) {
      alert('파일 업로드 실패: ' + error.message)
      return
    }
    const { data: { publicUrl } } = supabase.storage
      .from('meeting-minutes')
      .getPublicUrl(fileName)
    await updateCell(id, 'meeting_minutes_url', publicUrl)
    await updateCell(id, 'meeting_minutes_filename', file.name)
  }

  // 회의록 파일 삭제
  const deleteMeetingMinutes = async (id, url) => {
    if (!confirm('첨부된 회의록을 삭제하시겠습니까?')) return
    // URL에서 파일 경로 추출
    const pathMatch = url.match(/meeting-minutes\/(.+)$/)
    if (pathMatch) {
      await supabase.storage.from('meeting-minutes').remove([pathMatch[1]])
    }
    await updateCell(id, 'meeting_minutes_url', null)
    await updateCell(id, 'meeting_minutes_filename', null)
  }

  // CSV 다운로드
  const downloadCSV = () => {
    const headers = ['이름', '이메일', '전화번호', 'Instagram', 'TikTok', 'YouTube', '미팅유형', '미팅상태', '연락상태', '연락방법', '연락메모', '답변상태', '답변메모', '관심프로그램', '유입경로', '우선순위', '미팅날짜', '등록일']
    const rows = filtered.map(c => [
      c.creator_name, c.creator_email, c.creator_phone,
      c.instagram_handle, c.tiktok_handle, c.youtube_handle,
      c.meeting_type, c.meeting_status, c.contact_status,
      c.contact_method, c.contact_notes, c.response_status,
      c.response_notes, c.program_interest, c.source, c.priority,
      c.meeting_date ? new Date(c.meeting_date).toLocaleString('ko-KR') : '',
      c.created_at ? new Date(c.created_at).toLocaleString('ko-KR') : '',
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `meeting_consultations_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 필터링
  const filtered = consultations.filter(c => {
    const matchSearch = !searchTerm ||
      c.creator_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creator_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instagram_handle?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchContact = filterContact === 'all' || c.contact_status === filterContact
    const matchMeeting = filterMeeting === 'all' || c.meeting_status === filterMeeting
    return matchSearch && matchContact && matchMeeting
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <div className="max-w-full mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-bold text-gray-900">미팅 요청 크리에이터 관리</h1>
            <span className="text-sm text-gray-500">({filtered.length}건)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>
        </div>

        {/* 시트 탭 */}
        <div className="flex items-end gap-0 mb-0 border-b border-gray-200">
          {sheets.map(sheet => (
            <div
              key={sheet.id}
              className={`group relative flex items-center gap-1 px-4 py-2 text-sm font-medium cursor-pointer border border-b-0 rounded-t-lg transition-colors ${
                activeSheetId === sheet.id
                  ? 'bg-white text-purple-700 border-gray-200 -mb-px z-10'
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => setActiveSheetId(sheet.id)}
            >
              {editingSheetId === sheet.id ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    className="text-sm border rounded px-1 py-0.5 w-32"
                    value={editingSheetName}
                    onChange={e => setEditingSheetName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') updateSheetName(sheet.id); if (e.key === 'Escape') setEditingSheetId(null) }}
                    autoFocus
                  />
                  <button onClick={() => updateSheetName(sheet.id)} className="text-green-600 hover:text-green-700"><Save className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingSheetId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <span>{sheet.name}</span>
                  {activeSheetId === sheet.id && (
                    <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                      <button onClick={e => { e.stopPropagation(); setEditingSheetId(sheet.id); setEditingSheetName(sheet.name) }} className="text-gray-400 hover:text-blue-600"><Edit3 className="w-3 h-3" /></button>
                      {sheets.length > 1 && (
                        <button onClick={e => { e.stopPropagation(); deleteSheet(sheet.id) }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* 새 시트 추가 */}
          {showNewSheet ? (
            <div className="flex items-center gap-1 px-3 py-2 border border-b-0 border-gray-200 rounded-t-lg bg-white">
              <input
                className="text-sm border rounded px-2 py-0.5 w-36"
                placeholder="시트 이름..."
                value={newSheetName}
                onChange={e => setNewSheetName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createSheet(); if (e.key === 'Escape') { setShowNewSheet(false); setNewSheetName('') } }}
                autoFocus
              />
              <button onClick={createSheet} className="text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
              <button onClick={() => { setShowNewSheet(false); setNewSheetName('') }} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewSheet(true)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> 새 시트
            </button>
          )}
        </div>

        {/* 스프레드시트 영역 */}
        <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm">
          {/* 필터 & 검색 바 */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 focus:border-purple-400"
                placeholder="이름, 이메일, Instagram 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
              value={filterContact}
              onChange={e => setFilterContact(e.target.value)}
            >
              <option value="all">연락상태: 전체</option>
              <option value="not_contacted">미연락</option>
              <option value="contacted">연락완료</option>
              <option value="responded">응답받음</option>
              <option value="no_response">무응답</option>
            </select>
            <select
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-400"
              value={filterMeeting}
              onChange={e => setFilterMeeting(e.target.value)}
            >
              <option value="all">미팅상태: 전체</option>
              <option value="pending">대기</option>
              <option value="scheduled">예정</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소</option>
              <option value="no_show">불참</option>
            </select>
            <button
              onClick={() => setShowAddRow(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors ml-auto"
            >
              <UserPlus className="w-4 h-4" /> 크리에이터 추가
            </button>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-8 text-center text-xs">#</TableHead>
                  <TableHead className="text-xs min-w-[120px]">이름</TableHead>
                  <TableHead className="text-xs min-w-[160px]">이메일</TableHead>
                  <TableHead className="text-xs min-w-[120px]">전화번호</TableHead>
                  <TableHead className="text-xs min-w-[120px]">Instagram</TableHead>
                  <TableHead className="text-xs min-w-[120px]">TikTok</TableHead>
                  <TableHead className="text-xs min-w-[120px]">YouTube</TableHead>
                  <TableHead className="text-xs min-w-[90px]">미팅유형</TableHead>
                  <TableHead className="text-xs min-w-[90px]">미팅상태</TableHead>
                  <TableHead className="text-xs min-w-[100px]">미팅날짜</TableHead>
                  <TableHead className="text-xs min-w-[90px]">연락상태</TableHead>
                  <TableHead className="text-xs min-w-[90px]">연락방법</TableHead>
                  <TableHead className="text-xs min-w-[150px]">연락메모</TableHead>
                  <TableHead className="text-xs min-w-[90px]">답변상태</TableHead>
                  <TableHead className="text-xs min-w-[150px]">답변메모</TableHead>
                  <TableHead className="text-xs min-w-[120px]">관심프로그램</TableHead>
                  <TableHead className="text-xs min-w-[100px]">유입경로</TableHead>
                  <TableHead className="text-xs min-w-[80px]">우선순위</TableHead>
                  <TableHead className="text-xs min-w-[150px]">미팅노트</TableHead>
                  <TableHead className="text-xs min-w-[140px]">회의록 첨부</TableHead>
                  <TableHead className="text-xs min-w-[80px]">등록일</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 새 행 추가 폼 */}
                {showAddRow && (
                  <TableRow className="bg-purple-50/50">
                    <TableCell className="text-center text-xs text-gray-400">+</TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="이름 *" value={newRow.creator_name} onChange={e => setNewRow(p => ({ ...p, creator_name: e.target.value }))} autoFocus />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="이메일" value={newRow.creator_email} onChange={e => setNewRow(p => ({ ...p, creator_email: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="전화번호" value={newRow.creator_phone} onChange={e => setNewRow(p => ({ ...p, creator_phone: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="@handle" value={newRow.instagram_handle} onChange={e => setNewRow(p => ({ ...p, instagram_handle: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="@handle" value={newRow.tiktok_handle} onChange={e => setNewRow(p => ({ ...p, tiktok_handle: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="@handle" value={newRow.youtube_handle} onChange={e => setNewRow(p => ({ ...p, youtube_handle: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <select className="text-sm border rounded px-1 py-0.5 w-full" value={newRow.meeting_type} onChange={e => setNewRow(p => ({ ...p, meeting_type: e.target.value }))}>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="프로그램" value={newRow.program_interest} onChange={e => setNewRow(p => ({ ...p, program_interest: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <input className="text-sm border rounded px-1.5 py-0.5 w-full" placeholder="경로" value={newRow.source} onChange={e => setNewRow(p => ({ ...p, source: e.target.value }))} />
                    </TableCell>
                    <TableCell>
                      <select className="text-sm border rounded px-1 py-0.5 w-full" value={newRow.priority} onChange={e => setNewRow(p => ({ ...p, priority: e.target.value }))}>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button onClick={addRow} className="text-green-600 hover:text-green-700"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setShowAddRow(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {loading ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center py-12 text-gray-400">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                        데이터 로딩중...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={22} className="text-center py-12 text-gray-400">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>데이터가 없습니다</p>
                      <button onClick={() => setShowAddRow(true)} className="mt-2 text-sm text-purple-600 hover:text-purple-700">+ 첫 번째 크리에이터 추가</button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, idx) => (
                    <TableRow key={row.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="text-center text-xs text-gray-400">{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <EditableCell value={row.creator_name} onSave={v => updateCell(row.id, 'creator_name', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.creator_email} onSave={v => updateCell(row.id, 'creator_email', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.creator_phone} onSave={v => updateCell(row.id, 'creator_phone', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.instagram_handle} onSave={v => updateCell(row.id, 'instagram_handle', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.tiktok_handle} onSave={v => updateCell(row.id, 'tiktok_handle', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.youtube_handle} onSave={v => updateCell(row.id, 'youtube_handle', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.meeting_type}
                          type="select"
                          options={[{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }]}
                          onSave={v => updateCell(row.id, 'meeting_type', v)}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.meeting_status}
                          type="select"
                          options={[
                            { value: 'pending', label: '대기' },
                            { value: 'scheduled', label: '예정' },
                            { value: 'completed', label: '완료' },
                            { value: 'cancelled', label: '취소' },
                            { value: 'no_show', label: '불참' },
                          ]}
                          onSave={v => updateCell(row.id, 'meeting_status', v)}
                        />
                        <StatusBadge status={row.meeting_status} type="meeting" />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.meeting_date} type="date" onSave={v => updateCell(row.id, 'meeting_date', v)} />
                        <span className="text-xs text-gray-400">{formatDate(row.meeting_date)}</span>
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.contact_status}
                          type="select"
                          options={[
                            { value: 'not_contacted', label: '미연락' },
                            { value: 'contacted', label: '연락완료' },
                            { value: 'responded', label: '응답받음' },
                            { value: 'no_response', label: '무응답' },
                          ]}
                          onSave={v => updateCell(row.id, 'contact_status', v)}
                        />
                        <StatusBadge status={row.contact_status} type="contact" />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.contact_method}
                          type="select"
                          options={[
                            { value: '', label: '-' },
                            { value: 'email', label: 'Email' },
                            { value: 'phone', label: 'Phone' },
                            { value: 'dm', label: 'DM' },
                            { value: 'other', label: 'Other' },
                          ]}
                          onSave={v => updateCell(row.id, 'contact_method', v)}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.contact_notes} type="textarea" onSave={v => updateCell(row.id, 'contact_notes', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.response_status}
                          type="select"
                          options={[
                            { value: 'waiting', label: '대기중' },
                            { value: 'accepted', label: '수락' },
                            { value: 'declined', label: '거절' },
                            { value: 'pending', label: '보류' },
                          ]}
                          onSave={v => updateCell(row.id, 'response_status', v)}
                        />
                        <StatusBadge status={row.response_status} type="response" />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.response_notes} type="textarea" onSave={v => updateCell(row.id, 'response_notes', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.program_interest} onSave={v => updateCell(row.id, 'program_interest', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.source} onSave={v => updateCell(row.id, 'source', v)} />
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={row.priority}
                          type="select"
                          options={[
                            { value: 'low', label: 'Low' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'high', label: 'High' },
                            { value: 'urgent', label: 'Urgent' },
                          ]}
                          onSave={v => updateCell(row.id, 'priority', v)}
                        />
                        <StatusBadge status={row.priority} type="priority" />
                      </TableCell>
                      <TableCell>
                        <EditableCell value={row.meeting_notes} type="textarea" onSave={v => updateCell(row.id, 'meeting_notes', v)} />
                      </TableCell>
                      <TableCell>
                        {row.meeting_minutes_url ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={row.meeting_minutes_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 rounded px-2 py-1 max-w-[120px] truncate"
                              title={row.meeting_minutes_filename}
                            >
                              <FileText className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{row.meeting_minutes_filename || '회의록'}</span>
                            </a>
                            <button
                              onClick={() => deleteMeetingMinutes(row.id, row.meeting_minutes_url)}
                              className="text-gray-300 hover:text-red-500"
                              title="삭제"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 cursor-pointer bg-gray-50 hover:bg-purple-50 rounded px-2 py-1 transition-colors">
                            <Upload className="w-3 h-3" />
                            <span>파일 첨부</span>
                            <input
                              type="file"
                              accept=".doc,.docx,.pdf"
                              className="hidden"
                              onChange={e => { if (e.target.files[0]) uploadMeetingMinutes(row.id, e.target.files[0]) }}
                            />
                          </label>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {formatDate(row.created_at)}
                      </TableCell>
                      <TableCell>
                        <button onClick={() => deleteRow(row.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 하단 요약 */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500 rounded-b-lg">
            <div className="flex items-center gap-4">
              <span>전체: {consultations.length}건</span>
              <span>미연락: {consultations.filter(c => c.contact_status === 'not_contacted').length}</span>
              <span>연락완료: {consultations.filter(c => c.contact_status === 'contacted').length}</span>
              <span>응답: {consultations.filter(c => c.contact_status === 'responded').length}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>미팅대기: {consultations.filter(c => c.meeting_status === 'pending').length}</span>
              <span>미팅예정: {consultations.filter(c => c.meeting_status === 'scheduled').length}</span>
              <span>미팅완료: {consultations.filter(c => c.meeting_status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeetingConsultations
