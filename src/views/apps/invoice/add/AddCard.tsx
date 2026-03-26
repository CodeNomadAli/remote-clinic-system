'use client'

import { useState, SyntheticEvent } from 'react'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import type { FormDataType } from './AddCustomerDrawer';
import AddCustomerDrawer, { initialFormData } from './AddCustomerDrawer'
import Logo from '@components/layout/shared/Logo'

type MedicineItem = {
  name: string
  dosage: string
  time: string
}

type DoctorInvoiceProps = {
  invoiceData?: { id: string; name: string; company?: string; address?: string; contact?: string; companyEmail?: string; amount?: number }[]
  doctorName: string
}

const DoctorInvoice = ({ invoiceData, doctorName }: DoctorInvoiceProps) => {
  const [open, setOpen] = useState(false)
  const [selectData, setSelectData] = useState(invoiceData?.[0] || null)
  const [formData, setFormData] = useState<FormDataType>(initialFormData)

  const [issuedDate, setIssuedDate] = useState<Date | null>(null)
  const [dueDate, setDueDate] = useState<Date | null>(null)

  const [discount, setDiscount] = useState<number>(0)
  const [manualTotal, setManualTotal] = useState<number | null>(null)

  const [medicines, setMedicines] = useState<MedicineItem[]>([{ name: '', dosage: '', time: '' }])
  const [diagnosis, setDiagnosis] = useState('')
  const [nextCheckup, setNextCheckup] = useState<Date | null>(null)

  const [showPreview, setShowPreview] = useState(false)

  const isBelowMdScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const subtotal = invoiceData?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0
  const tax = subtotal * 0.1
  const total = manualTotal !== null ? manualTotal : subtotal - discount + tax

  const updateMedicine = (index: number, key: keyof MedicineItem, value: string) => {
    const newMeds = [...medicines]

    newMeds[index][key] = value
    setMedicines(newMeds)
  }

  const addMedicineRow = () => setMedicines([...medicines, { name: '', dosage: '', time: '' }])
  const removeMedicineRow = (index: number) => setMedicines(medicines.filter((_, i) => i !== index))

  return (
    <>
      <Card>
        <CardContent className='sm:!p-12'>
          <Grid container spacing={6}>
            {/* Header */}
            <Grid item xs={12}>
              <div className='p-6 bg-actionHover rounded flex flex-col sm:flex-row justify-between gap-4'>
                <div className='flex flex-col gap-4'>
                  <Logo />
                  <Typography>Office 149, 450 South Brand Brooklyn</Typography>
                  <Typography>San Diego County, CA 91905, USA</Typography>
                  <Typography>+1 (123) 456 7891, +44 (876) 543 2198</Typography>
                </div>
                <div className='flex flex-col gap-2'>
                  <Typography variant='h5'>Invoice</Typography>
                  <TextField
                    label='Invoice #'
                    value={invoiceData?.[0].id || ''}
                    InputProps={{ readOnly: true, startAdornment: <InputAdornment position='start'>#</InputAdornment> }}
                  />
                  <AppReactDatepicker
                    selected={issuedDate}
                    placeholderText='YYYY-MM-DD'
                    dateFormat='yyyy-MM-dd'
                    onChange={date => setIssuedDate(date)}
                    customInput={<TextField label='Date Issued' />}
                  />
                  <AppReactDatepicker
                    selected={dueDate}
                    placeholderText='YYYY-MM-DD'
                    dateFormat='yyyy-MM-dd'
                    onChange={date => setDueDate(date)}
                    customInput={<TextField label='Due Date' />}
                  />
                </div>
              </div>
            </Grid>

            {/* Customer & Billing */}
            <Grid item xs={12}>
              <div className='flex flex-col sm:flex-row justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                  <Typography className='font-medium'>Invoice To:</Typography>
                  <TextField
                    select
                    value={selectData?.id || ''}
                    onChange={e =>
                      setSelectData(invoiceData?.find(item => item.id === e.target.value) || null)
                    }
                  >
                    <MenuItem value=''>Add New Customer</MenuItem>
                    {invoiceData?.map(inv => (
                      <MenuItem key={inv.id} value={inv.id}>
                        {inv.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  {selectData && (
                    <div>
                      <Typography>{selectData.name}</Typography>
                      <Typography>{selectData.company}</Typography>
                      <Typography>{selectData.address}</Typography>
                      <Typography>{selectData.contact}</Typography>
                      <Typography>{selectData.companyEmail}</Typography>
                    </div>
                  )}
                </div>

                {/* Billing */}
                <div className='flex flex-col gap-2'>
                  <Typography className='font-medium'>Billing</Typography>
                  <TextField label='Subtotal' type='number'  value={subtotal.toFixed(2)} InputProps={{ readOnly: true }} />
                  <TextField
                    label='Discount'
                    type='number'
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                  />
                  <TextField label='Tax (10%) ' type='number' value={tax.toFixed(2)} InputProps={{ readOnly: true }} />
                  <TextField
                    label='Total'
                    type='number'
                    value={total.toFixed(2)}
                    onChange={e => setManualTotal(Number(e.target.value))}
                  />
                </div>
              </div>
            </Grid>

            {/* Medicines */}
            <Grid item xs={12}>
              <Typography className='font-medium mb-2'>Medicines</Typography>
              {medicines.map((med, index) => (
                <Grid key={index} container spacing={2} className='mb-2 items-center'>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label='Medicine Name'
                      value={med.name}
                      onChange={e => updateMedicine(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label='Dosage'
                      value={med.dosage}
                      onChange={e => updateMedicine(index, 'dosage', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      label='Time / Frequency'
                      value={med.time}
                      onChange={e => updateMedicine(index, 'time', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton color='error' onClick={() => removeMedicineRow(index)}>
                      <i className='tabler-x text-2xl' />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button variant='contained' size='small' onClick={addMedicineRow}>
                Add Medicine
              </Button>
            </Grid>

            {/* Diagnosis & Next Checkup */}
            <Grid item xs={12}>
              <TextField
                label='Diagnosis / Disease Notes'
                multiline
                rows={3}
                fullWidth
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
              />
              <AppReactDatepicker
                selected={nextCheckup}
                placeholderText='Next Checkup (Optional)'
                dateFormat='yyyy-MM-dd'
                onChange={date => setNextCheckup(date)}
                customInput={<TextField label='Next Checkup' />}
              />
            </Grid>

            {/* Save Button */}
            <Grid item xs={12}>
              <Button
                variant='contained'
                fullWidth
                onClick={() => setShowPreview(true)}
              >
                Save Invoice & Preview
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AddCustomerDrawer
        open={open}
        setOpen={setOpen}
        onFormSubmit={data => setFormData(data)}
      />

      {/* Preview Section */}
      {showPreview && (
        <Card className='mt-6'>
          <CardContent>
            <Typography variant='h6'>Invoice Preview</Typography>
            <Divider className='mb-2' />
            <Typography><strong>Doctor:</strong> {doctorName}</Typography>
            <Typography><strong>Patient:</strong> {selectData?.name}</Typography>
            <Typography><strong>Next Checkup:</strong> {nextCheckup ? nextCheckup.toLocaleDateString() : 'N/A'}</Typography>
            <Typography><strong>Diagnosis:</strong> {diagnosis || 'N/A'}</Typography>
            <Divider className='my-2' />
            <Typography className='font-medium'>Medicines:</Typography>
            {medicines.map((med, i) => (
              <Typography key={i}>
                {med.name} - {med.dosage} - {med.time}
              </Typography>
            ))}
            <Divider className='my-2' />
            <Typography><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</Typography>
            <Typography><strong>Discount:</strong> ${discount.toFixed(2)}</Typography>
            <Typography><strong>Tax:</strong> ${tax.toFixed(2)}</Typography>
            <Typography><strong>Total:</strong> ${total.toFixed(2)}</Typography>
          </CardContent>
        </Card>
      )}
    </>
  )
}

export default DoctorInvoice
