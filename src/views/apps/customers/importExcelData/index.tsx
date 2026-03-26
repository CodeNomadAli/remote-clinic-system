'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import {
  Box,
  Button,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'



import {
  showLoading,
  hideLoading,
  showSuccess,
  showError,
} from '@/utils/frontend-helper'

// Updated systemFields with key and label
const systemFields = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'address', label: 'Address' },
  { key: 'countriesId', label: 'Country ID' },
  { key: 'companies', label: 'Company Name' },
  { key: 'companiesTypesId', label: 'Company Type ID' },
  { key: 'products', label: 'Products' },
]

export default function CustomerImport() {
  const router = useRouter()
  const [excelHeaders, setExcelHeaders] = useState<string[]>([])
  const [excelData, setExcelData] = useState<any[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    const headersStr = sessionStorage.getItem('excelHeaders')
    const dataStr = sessionStorage.getItem('excelData')

    if (headersStr && dataStr) {
      const headers: string[] = JSON.parse(headersStr)
      const data: any[] = JSON.parse(dataStr)

      setExcelHeaders(headers)
      setExcelData(data)

      const initialMap: Record<string, string> = {}

      systemFields.forEach(({ key }) => {
        const match = headers.find(
          h =>
            typeof h === 'string' &&
            h.toLowerCase().replace(/[^a-z]/g, '') ===
            key.toLowerCase().replace(/[^a-z]/g, '')
        )

        if (match) initialMap[key] = match
      })

      setFieldMapping(initialMap)
    } else {
      showError('No Excel data found. Please upload a file first.')
    }
  }, [])

  const handleFieldInputChange = (systemFieldKey: string, excelColumnName: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [systemFieldKey]: excelColumnName,
    }))
  }

  const transformRow = (row: any) => {
    const mappedRow: any = {}

    for (const [sysField, excelField] of Object.entries(fieldMapping)) {
      mappedRow[sysField] = row[excelField]
    }

    const productsRaw = mappedRow.products

    const products = Array.isArray(productsRaw)
      ? productsRaw
        .filter((p: any) => p != null && String(p).trim() !== '')
        .map((p: any) => String(p).trim())
      : typeof productsRaw === 'string' && productsRaw.trim()
        ? productsRaw.split(',').map((p: string) => p.trim()).filter((p: string) => p !== '')
        : []


    return {
      ...mappedRow,
      phoneNumber: String(mappedRow.phoneNumber ?? '').trim(),
      countriesId: String(mappedRow.countriesId ?? '').trim(),
      companies: String(mappedRow.companies ?? '').trim(),
      companiesTypesId: String(mappedRow.companiesTypesId ?? '').trim(),
      products,
    }
  }

  const handleSubmit = async () => {
    if (!excelData.length) {
      showError('No data to import')

      return
    }

    // Filter valid rows
    const validRows = excelData.filter((row, index) => {
      const productsRaw = row[fieldMapping.products]

      const products = Array.isArray(productsRaw)
        ? productsRaw.filter((p: any) => p != null && String(p).trim() !== '')
        : typeof productsRaw === 'string' && productsRaw.trim()
          ? productsRaw.split(',').map((p: string) => p.trim()).filter((p: string) => p !== '')
          : []

      const companies = row[fieldMapping.companies]
      const hasCompany = companies && String(companies).trim() !== ''

      const isValid = products.length > 0 && hasCompany

      if (!isValid) {
        console.warn(`Skipping invalid row ${index + 2}:`, row)
      }

      return isValid
    })

    if (!validRows.length) {
      showError('All rows are invalid. Nothing to import.')

      return
    }

    showLoading()

    const CHUNK_SIZE = 100
    const allCreated: any[] = []
    const allFailed: any[] = []

    try {
      for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
        const rawChunk = validRows.slice(i, i + CHUNK_SIZE)
        const transformedChunk = rawChunk.map(transformRow)

        const response = await fetch('/api/customers/import-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: transformedChunk }),
        })

        const result = await response.json()

        if (!response.ok) {
          showError(result.failed || `Record ${i / CHUNK_SIZE + 1} failed to import.`)
          allFailed.push(...(result.data?.failed || []))
          continue
        }

        if (result.message) {
          showSuccess(result.createdCustomers || result.failed)
        }

        allCreated.push(...(result.data?.customers || []))
        allFailed.push(...(result.data?.failed || []))

        await new Promise(res => setTimeout(res, 300))
      }

      if (allCreated.length) {
        showSuccess(`Imported customers successfully!`)
      }

      if (allFailed.length) {

        showError(`Something went wrong `)
      }
    } catch (error) {

      showError('An error occurred during import. Please try again.')
    } finally {
      hideLoading()
      sessionStorage.removeItem('excelHeaders')
      sessionStorage.removeItem('excelData')
      setExcelHeaders([])
      setExcelData([])
      setFieldMapping({})

      router.push('/customers/list')
    }
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        Map Your Excel Columns to System Fields
      </Typography>

      {excelData.length > 0 ? (
        <Grid container spacing={2}>
          {systemFields.map(({ key, label }) => (
            <Grid item xs={12} md={6} key={key}>
              <Typography variant="subtitle1" gutterBottom>
                {label}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select Excel Column</InputLabel>
                <Select
                  value={fieldMapping[key] || ''}
                  label="Select Excel Column"
                  onChange={e => handleFieldInputChange(key, e.target.value)}
                >
                  {excelHeaders.map(header => (
                    <MenuItem key={header} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              sx={{ mt: 3 }}
              startIcon={<i className="tabler-check" />}
            >
              Submit Data
            </Button>
          </Grid>
        </Grid>
      ) : (
        <Typography>No Excel data found. Please upload a file first.</Typography>
      )}
    </Box>
  )
}
