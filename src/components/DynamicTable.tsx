'use client'

import { useMemo, useCallback, useContext, useState } from 'react'

import { useRouter } from 'next/navigation'

import type { ColumnDef } from '@tanstack/react-table'
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, Box, Typography, Select, MenuItem, TextField, InputAdornment, IconButton, Menu
} from '@mui/material'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import ShareIcon from '@mui/icons-material/Share'

import { useCanDoAction, showLoading, hideLoading, showSuccess, showError } from '@/utils/frontend-helper'
import { SettingsContext } from '@core/contexts/settingsContext'

interface DynamicTableProps<T> {
  resource: string
  permissionKey: string
  data: T[]
  columns: ColumnDef<T>[]
  pagination: {
    totalRecords: number
    totalPages: number
    page: number
    pageSize: number
  }
}

const DynamicTable = <T extends { id: string }>({
  resource,
  permissionKey,
  data,
  columns,
  pagination,
}: DynamicTableProps<T>) => {
  const router = useRouter()
  const candoAction = useCanDoAction()
  const { permissions = [] } = useContext(SettingsContext)!.settings

  const [search, setSearch] = useState('')

  // 🔹 Flatten object to string recursively
  const valueToString = (val: any): string => {
    if (val === null || val === undefined) return ''
    if (Array.isArray(val)) return val.map(valueToString).join(' ')
    if (typeof val === 'object') return Object.values(val).map(valueToString).join(' ')

    return val.toString()
  }

  // 🔹 Filter data dynamically for all columns
  const filteredData = useMemo(() => {
    if (!search) return data
    const lowerSearch = search.toLowerCase()


    return data.filter(row => valueToString(row).toLowerCase().includes(lowerSearch))
  }, [search, data])

  const handleView = useCallback((id: string) => router.push(`/${resource}/show/${id}`), [router, resource])
  const handleEdit = useCallback((id: string) => router.push(`/${resource}/form/${id}`), [router, resource])

  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${permissionKey}?`)) {
      try {
        showLoading()
        const res = await fetch(`/api/${resource}/${id}`, { method: 'DELETE' })
        const req = await res.json()

        if (res.ok) {
          showSuccess(req.message || `${permissionKey} deleted successfully`)
          router.refresh()
        } else showError(req.message)
      } catch (error) {
        console.error(error)
        showError(`Failed to delete ${permissionKey}`)
      } finally { hideLoading() }
    }
  }, [router, resource, permissionKey])

  // 🔹 Actions column with 3-dots share menu
  const actionsColumn = useMemo<ColumnDef<T>>(() => ({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
      const open = Boolean(anchorEl)

      const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget)
      const handleMenuClose = () => setAnchorEl(null)

      const handleShare = (platform: 'whatsapp' | 'facebook') => {
        const url = encodeURIComponent(window.location.href) // current page URL

        if (platform === 'whatsapp') {
          window.open(`https://api.whatsapp.com/send?text=${url}`, '_blank')
        } else if (platform === 'facebook') {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
        }

        handleMenuClose()
      }

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {candoAction(`read:${permissionKey}`) && (
            <Button size="small" variant="outlined" color="secondary" onClick={() => handleView(row.original.id)} startIcon={<i className="tabler-eye" />}>View</Button>
          )}
          {candoAction(`update:${permissionKey}`) && (
            <Button size="small" variant="outlined" onClick={() => handleEdit(row.original.id)}>Edit</Button>
          )}
          {candoAction(`delete:${permissionKey}`) && (
            <Button size="small" variant="outlined" onClick={() => handleDelete(row.original.id)} color="error" startIcon={<i className="tabler-trash" />}>Delete</Button>
          )}

          {/* 3 dots menu */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleShare('whatsapp')}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share to WhatsApp
            </MenuItem>
            <MenuItem onClick={() => handleShare('facebook')}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} /> Share to Facebook
            </MenuItem>
          </Menu>
        </Box>
      )
    },
    size: 150,
  }), [handleView, handleEdit, handleDelete, permissions, permissionKey])

  const allColumns = useMemo(() => [...columns, actionsColumn], [columns, actionsColumn])

  const table = useReactTable({
    data: filteredData,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
    filterFns: { fuzzy: () => false },
    state: { pagination: { pageIndex: pagination.page - 1, pageSize: pagination.pageSize } },
  })

  const handlePageChange = (newPageIndex: number) => router.push(`?page=${newPageIndex + 1}&pageSize=${pagination.pageSize}`)
  const handlePageSizeChange = (newPageSize: number) => router.push(`?page=1&pageSize=${newPageSize}`)

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <TextField
          size="small"
          placeholder={`Search ${resource}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><i className="tabler-search" /></InputAdornment> }}
        />
      </Box>

      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell key={header.id} sx={{ width: header.getSize() }}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} sx={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 'medium' }}>
          Showing {table.getRowModel().rows.length} of {pagination.totalRecords} records
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            disabled={!table.getCanPreviousPage()}
            onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
            sx={{ minWidth: 80, borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.dark' }, '&:disabled': { borderColor: 'action.disabled', color: 'action.disabled' } }}
          >
            Previous
          </Button>
          <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', px: 1 }}>
            Page {table.getState().pagination.pageIndex + 1} of {pagination.totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={!table.getCanNextPage()}
            onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
            sx={{ minWidth: 80, borderColor: 'primary.main', color: 'primary.main', '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.dark' }, '&:disabled': { borderColor: 'action.disabled', color: 'action.disabled' } }}
          >
            Next
          </Button>
          <Select
            value={pagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            sx={{ height: 36, minWidth: 80, '.MuiSelect-select': { py: 0.75, fontSize: '0.875rem' } }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </Box>
      </Box>
    </Box>
  )
}

export default DynamicTable
