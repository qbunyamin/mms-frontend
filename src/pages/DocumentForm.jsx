import React from 'react';
import {
    TextField, Button, MenuItem, Grid, Typography, Paper
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

const schema = yup.object().shape({
    projectCode: yup.string().required(),
    type: yup.string().required(),
    documentNo: yup.string().required(),
    title: yup.string().required(),
    contractDate: yup.date().required(),
    status: yup.string().required(),
    approvalStatus: yup.string().required(),
    description: yup.string(),
    createdBy: yup.string().required(),
});

const DocumentForm = () => {
    const { control, handleSubmit, reset } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => formData.append(key, data[key]));
        formData.append('file', data.file[0]);

        try {
            const response = await axios.post('/api/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Başarıyla yüklendi!');
            reset();
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu.');
        }
    };

    return (
        <Paper sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Döküman Ekle</Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    {[
                        ['projectCode', 'Proje Kodu'],
                        ['type', 'Tip'],
                        ['documentNo', 'Döküman No'],
                        ['title', 'Konu'],
                        ['contractDate', 'Kontrat Tarihi'],
                        ['status', 'Durum'],
                        ['approvalStatus', 'Onay Durumu'],
                        ['description', 'Açıklama'],
                        ['createdBy', 'Yükleyen']
                    ].map(([name, label]) => (
                        <Grid item xs={12} sm={6} key={name}>
                            <Controller
                                name={name}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={label}
                                        fullWidth
                                        multiline={name === 'description'}
                                        type={name === 'contractDate' ? 'date' : 'text'}
                                        InputLabelProps={name === 'contractDate' ? { shrink: true } : {}}
                                    />
                                )}
                            />
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Controller
                            name="file"
                            control={control}
                            render={({ field }) => (
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.dwg"
                                    onChange={(e) => field.onChange(e.target.files)}
                                    required
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" type="submit">Kaydet</Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default DocumentForm;
