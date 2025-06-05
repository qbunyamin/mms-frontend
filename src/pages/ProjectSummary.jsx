import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    Button
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const ProjectSummary = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/projects/summary')
            .then(res => {
                setRows(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Proje özeti hatasııı:', err);
                setLoading(false);
            });
    }, []);

    const exportToExcel = () => {
        const exportData = rows.map(row => ({
            PROJELER: row.projectCode,
            "Data Girilmiş": row.dataGirilmis,
            "Yayınlanmış": row.yayinlanmis,
            "Klass Onaylı": row.klassOnayli,
            "Bayrak Onaylı": row.bayrakOnayli,
            "Onayda": row.onayda,
            "Gecikmiş": row.gecikmis,
            "Toplam": row.toplam,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projeler Özeti');

        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(file, 'proje_ozeti.xlsx');
    };


    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(12);
            doc.text('Proje Özeti', 14, 15);

            const tableColumn = [
                'PROJELER',
                'Data Girilmiş',
                'Yayınlanmış',
                'Klass Onaylı',
                'Bayrak Onaylı',
                'Onayda',
                'Gecikmiş',
                'Toplam'
            ];

            const tableRows = rows.map(row => [
                row.projectCode,
                row.dataGirilmis,
                row.yayinlanmis,
                row.klassOnayli,
                row.bayrakOnayli,
                row.onayda,
                row.gecikmis,
                row.toplam
            ]);


            if (doc.autoTable) {
                doc.autoTable({
                    head: [tableColumn],
                    body: tableRows,
                    startY: 20,
                    styles: { fontSize: 9 }
                });
            } else {
                console.error('autoTable fonksiyonu yüklü değil!');
                alert('PDF export için jspdf-autotable modülü yüklenemedi.');
            }

            doc.save('proje_ozeti.pdf');
        } catch (err) {
            console.error('PDF oluşturma hatası:', err);
            alert('PDF oluşturulurken hata oluştu.');
        }
    };


    const columns = [
        { field: 'projectCode', headerName: 'PROJELER', flex: 1, minWidth: 130 },
        { field: 'dataGirilmis', headerName: 'Data Girilmiş', flex: 1, minWidth: 100 },
        { field: 'yayinlanmis', headerName: 'Yayınlanmış', flex: 1, minWidth: 100 },
        { field: 'klassOnayli', headerName: 'Klass Onaylı', flex: 1, minWidth: 100 },
        { field: 'bayrakOnayli', headerName: 'Bayrak Onaylı', flex: 1, minWidth: 100 },
        { field: 'onayda', headerName: 'Onayda', flex: 1, minWidth: 100 },
        { field: 'gecikmis', headerName: 'Gecikmiş', flex: 1, minWidth: 100 },
        { field: 'toplam', headerName: 'Toplam', flex: 1, cellClassName: 'font-bold', minWidth: 100 },
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>Proje Özeti</Typography>

            <Box display="flex" gap={2} mb={2}>
                <Button variant="outlined" onClick={exportToExcel}>Excel'e Aktar</Button>
                <Button variant="outlined" onClick={exportToPDF}>PDF'e Aktar</Button>
            </Box>

            <Paper elevation={3} sx={{ mt: 2 }}>
                <Box sx={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        getRowId={(row) => row.projectCode}
                        loading={loading}
                        components={{ LoadingOverlay: LinearProgress }}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#e0f7fa',
                                fontWeight: 'bold',
                            },
                            '& .font-bold': {
                                fontWeight: 'bold',
                            },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default ProjectSummary;
