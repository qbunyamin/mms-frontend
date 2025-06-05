import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    LinearProgress,
    Drawer,
    Divider,
    IconButton,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TableHead
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';


const DocumentList = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [revisions, setRevisions] = useState([]);
    const [remarkTab, setRemarkTab] = useState(0);
    const [remarks, setRemarks] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterProject, setFilterProject] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});

    const filteredRows = rows.filter((row) => {
        const matchSearch =
            row.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            row.documentNo?.toLowerCase().includes(searchText.toLowerCase());

        const matchProject = filterProject ? row.projectCode === filterProject : true;
        const matchStatus = filterStatus ? row.status === filterStatus : true;
        const matchType = filterType ? row.type === filterType : true;

        return matchSearch && matchProject && matchStatus && matchType;
    });

    const handleUpdateOpen = (row) => {
        setSelectedDoc(row);
        setFormData(row);
        setEditMode(true);
        setDrawerOpen(true);
        setTabIndex(0);
    };


    useEffect(() => {
        if (!selectedDoc) return;

        axios
            .get(`/api/documents/${selectedDoc._id}/remarks`)
            .then((res) => setRemarks(res.data))
            .catch((err) => console.error('Yorum çekme hatası:', err));
    }, [selectedDoc]);


    useEffect(() => {
        axios
            .get('/api/documents')
            .then((res) => {
                setRows(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('API Hatası:', err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!selectedDoc) return;

        axios
            .get(`/api/documents/${selectedDoc._id}`)
            .then(res => {
                setRevisions(res.data.revisions || []);
            })
            .catch(err => console.error('Revizyon çekme hatası:', err));
    }, [selectedDoc]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleRowClick = (params) => {
        setSelectedDoc(params.row);
        setDrawerOpen(true);
        setTabIndex(0); // Drawer açıldığında ilk sekme açık olsun
    };

    const columns = [
        { field: 'projectCode', headerName: 'Proje Kodu', flex: 1, minWidth: 100 },
        { field: 'documentNo', headerName: 'D. No', flex: 1.5, minWidth: 80 },
        { field: 'type', headerName: 'Tip', flex: 1, minWidth: 100 },
        { field: 'title', headerName: 'Konu', flex: 1.5, minWidth: 120 },
        {
            field: 'currentRevision',
            headerName: 'Revizyon No',
            flex: 0.8,
            type: 'number',
            minWidth: 100,
        },
        {
            field: 'createdAt',
            headerName: 'Ekleme Tarihi',
            flex: 1.2,
            minWidth: 160,
            renderCell: (params) => {
                const date = new Date(params.value);
                return isNaN(date.getTime()) ? '—' : date.toLocaleString();
            }
        },
        {
            field: 'createdBy',
            headerName: 'Yükleyen',
            flex: 1,
            minWidth: 130,
        },
        { field: 'status', headerName: 'Durum', flex: 1, minWidth: 120 },
        {
            field: 'approvalStatus',
            headerName: 'Onay Durumu',
            flex: 1.2,
            minWidth: 130,
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 120,
            renderCell: (params) => (
                <button onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateOpen(params.row);
                }}>
                    Güncelle
                </button>
            )
        },

    ];

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                    <input
                        type="text"
                        placeholder="Ara (Konu, Döküman No)"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />

                    <Box display="flex" gap={2}>
                        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
                            <option value="">Tüm Projeler</option>
                            {Array.from(new Set(rows.map(r => r.projectCode))).map(code => (
                                <option key={code} value={code}>{code}</option>
                            ))}
                        </select>

                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">Tüm Durumlar</option>
                            <option value="Data Girilmiş">Data Girilmiş</option>
                            <option value="Yayınlanmış">Yayınlanmış</option>
                        </select>

                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">Tüm Tipler</option>
                            {Array.from(new Set(rows.map(r => r.type))).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </Box>
                </Box>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Döküman Listesi
            </Typography>

            <Paper elevation={3} sx={{ mt: 2 }}>
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        getRowId={(row) => row._id}
                        loading={loading}
                        pageSize={10}
                        onRowClick={handleRowClick}
                        rowsPerPageOptions={[10, 20, 50]}
                        components={{
                            LoadingOverlay: LinearProgress,
                        }}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                            },
                        }}
                    />
                </Box>
            </Paper>

            {/* Drawer: Döküman Detayı ve Revizyonlar */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { width: 420, p: 2 } }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Döküman Detayı</Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ my: 2 }} />

                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Detaylar" />
                    <Tab label="Revizyonlar" />
                    <Tab label="Yorumlar" />
                </Tabs>

                {selectedDoc && tabIndex === 0 && (
                    <Box mt={2} display="flex" flexDirection="column" gap={1}>
                        <Typography><strong>Proje:</strong> {selectedDoc.projectCode}</Typography>
                        <Typography><strong>Döküman No:</strong> {selectedDoc.documentNo}</Typography>
                        <Typography><strong>Tip:</strong> {selectedDoc.type}</Typography>
                        <Typography><strong>Konu:</strong> {selectedDoc.title}</Typography>
                        <Typography><strong>Durum:</strong> {selectedDoc.status}</Typography>
                        <Typography><strong>Onay Durumu:</strong> {selectedDoc.approvalStatus}</Typography>
                        <Typography><strong>Yükleyen:</strong> {selectedDoc.createdBy}</Typography>
                        <Typography><strong>Tarih:</strong> {new Date(selectedDoc.createdAt).toLocaleString()}</Typography>
                        <Typography><strong>Açıklama:</strong> {selectedDoc.description}</Typography>
                    </Box>
                )}

                {tabIndex === 0 && editMode && (
                    <Box component="form" onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            const res = await axios.put(`/api/documents/${formData._id}`, formData);
                            alert('Güncelleme başarılı');
                            setEditMode(false);

                            // Listeyi yenile
                            const updatedList = await axios.get('/api/documents');
                            setRows(updatedList.data);
                        } catch (err) {
                            console.error(err);
                            alert('Güncelleme başarısız');
                        }
                    }} display="flex" flexDirection="column" gap={1} mt={2}>
                        <input
                            value={formData.projectCode || ''}
                            onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                            placeholder="Proje Kodu"
                        />
                        <input
                            value={formData.type || ''}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            placeholder="Proje Kodu"
                        />
                        <input
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Konu"
                        />
                        <input
                            value={formData.status || ''}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            placeholder="Durum"
                        />
                        <input
                            value={formData.approvalStatus || ''}
                            onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
                            placeholder="Onay Durumu"
                        />

                        <button type="submit">Kaydet</button>
                    </Box>
                )}

                {tabIndex === 1 && (
                    <Box mt={2}>
                        {/* Revizyon Tablosu */}
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>No</TableCell>
                                        <TableCell>Tarih</TableCell>
                                        <TableCell>Yükleyen</TableCell>
                                        <TableCell>Açıklama</TableCell>
                                        <TableCell>İndir</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {revisions.map((rev) => (
                                        <TableRow key={rev._id}>
                                            <TableCell>{rev.revisionNo}</TableCell>
                                            <TableCell>{new Date(rev.uploadedAt).toLocaleString()}</TableCell>
                                            <TableCell>{rev.uploadedBy}</TableCell>
                                            <TableCell>{rev.notes}</TableCell>
                                            <TableCell>
                                                <a
                                                    href={`/uploads/${rev.filePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    İndir
                                                </a>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Yeni Revizyon Ekleme Formu */}
                        <Box
                            component="form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target;
                                const formData = new FormData(form);

                                try {
                                    await axios.post(`/api/documents/${selectedDoc._id}/revision`, formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });

                                    alert('Revizyon başarıyla eklendi');

                                    // Listeyi güncelle
                                    const res = await axios.get(`/api/documents/${selectedDoc._id}`);
                                    setRevisions(res.data.revisions || []);
                                    form.reset();
                                } catch (err) {
                                    console.error(err);
                                    alert('Revizyon eklenemedi.');
                                }
                            }}
                            mt={3}
                        >
                            <Typography variant="subtitle1" mt={2} mb={1}>
                                Yeni Revizyon Ekle
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <input type="number" name="revisionNo" placeholder="Revizyon No" required />
                                <input type="text" name="uploadedBy" placeholder="Yükleyen" required />
                                <input type="text" name="notes" placeholder="Açıklama" required />
                                <input type="file" name="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.dwg" required />
                                <button type="submit">Kaydet</button>
                            </Box>
                        </Box>
                    </Box>
                )}

                {tabIndex === 2 && (
                    <Box mt={2}>
                        <Tabs
                            value={remarkTab}
                            onChange={(e, newVal) => setRemarkTab(newVal)}
                            variant="fullWidth"
                        >
                            <Tab label="Owner" />
                            <Tab label="Design" />
                            <Tab label="Class" />
                            <Tab label="Flag" />
                        </Tabs>

                        {/* Seçili role göre yorumlar */}
                        <Box mt={2}>
                            {remarks
                                .filter((r) => r.role === ['Owner', 'Design', 'Class', 'Flag'][remarkTab])
                                .map((remark) => (
                                    <Box key={remark._id} mb={2} p={1} border="1px solid #ccc" borderRadius={1}>
                                        <Typography variant="body2">{remark.content}</Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {remark.createdBy} – {new Date(remark.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                ))}
                        </Box>

                        {/* Yorum ekleme formu */}
                        <Box
                            component="form"
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target;
                                const formData = {
                                    role: ['Owner', 'Design', 'Class', 'Flag'][remarkTab],
                                    content: form.content.value,
                                    createdBy: form.createdBy.value
                                };
                                try {
                                    await axios.post(`/api/documents/${selectedDoc._id}/remarks`, formData);
                                    const updated = await axios.get(`/api/documents/${selectedDoc._id}/remarks`);
                                    setRemarks(updated.data);
                                    form.reset();
                                } catch (err) {
                                    console.error(err);
                                    alert('Yorum eklenemedi');
                                }
                            }}
                        >
                            <input type="text" name="createdBy" placeholder="Yazan kişi" required />
                            <textarea name="content" placeholder="Yorum" rows="3" required />
                            <button type="submit">Yorum Ekle</button>
                        </Box>
                    </Box>
                )}

            </Drawer>
        </Box>
    );
};

export default DocumentList;
