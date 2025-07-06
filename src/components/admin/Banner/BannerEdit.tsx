import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AutoComplete,
  Button,
  DatePicker,
  Form,
  Input,
  message,
  Spin,
  Switch,
  Tooltip,
  Upload,
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { IBanner } from '../../../interface/banner';
import { getAllBanners, getBannerById, updateBanner } from '../../../api/admin/banner';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { FiUpload } from 'react-icons/fi';
import { ArrowLeftOutlined } from '@ant-design/icons';

dayjs.extend(isSameOrAfter);

const BannerEdit = () => {
  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    getValues,
    reset,
  } = useForm<IBanner>({
    defaultValues: {
      name: '',
      imageUrl: '',
      link: '',
      startDate: new Date(),
      endDate: new Date(),
      order: 0,
      description: '',
      status: true,
    },
  });

  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const image = watch('imageUrl');

  const { data: bannerList } = useQuery({
    queryKey: ['banners'],
    queryFn: async () => {
      try {
        const response = await getAllBanners();
        return response.data;
      } catch (error) {
        message.error('Lỗi khi tải danh sách banner');
      }
    }
  });

  const currentId = getValues("_id");

  const existingOrders = bannerList?.filter((banner: any) => banner._id !== currentId)
  .map((banner: any) => Number(banner.order)) || [];

  useQuery({
    queryKey: ['banners', params.id],
    queryFn: async () => {
      if (!params.id) return;
      const { data: banner } = await getBannerById(params.id);
      reset({
        ...banner,
        startDate: dayjs(banner.startDate),
        endDate: dayjs(banner.endDate),
      });
      return banner;
    },
    enabled: !!params.id,
  });

  const mutation = useMutation({
    mutationFn: async (data: IBanner) => {
      const response = await updateBanner(params.id as string, data);
      return response.data;
    },
    onSuccess: () => {
      message.success('Cập nhật banner thành công.');
      navigate('/admin/banner/list');
    },
    onError: () => {
      message.error('Cập nhật banner thất bại, vui lòng thử lại.');
    },
  });

  const uploadImage = async (fileList: File[]) => {
    const name = watch('name');
    if (!fileList || fileList.length === 0 || !name) {
      message.warning('Vui lòng nhập tên banner trước khi tải ảnh');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    const publicId = `banner_${name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
    const renamedFile = new File([fileList[0]], publicId, { type: fileList[0].type });

    formData.append('file', renamedFile);
    formData.append('upload_preset', 'datn-xphone');

    try {
      const { data } = await axios.post('https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload', formData);
      setValue('imageUrl', data.secure_url, { shouldValidate: true });
      message.success('Tải ảnh thành công');
    } catch (error) {
      console.error(error);
      message.error('Lỗi upload ảnh');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: IBanner) => {
    const payload = {
      ...data,
      status: data.status ?? false,
      startDate: dayjs(data.startDate, 'DD/MM/YYYY').toDate(), 
      endDate: dayjs(data.endDate, 'DD/MM/YYYY').toDate(),
    };

    mutation.mutate(payload);
  };

  return (
    <div className="mx-auto mt-10 p-6 bg-white shadow rounded border-2">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Cập nhật Banner</h2>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Tên banner */}
        <Form.Item
          label="Tên banner"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Không để trống tên banner' }}
            render={({ field }) => <Input {...field} placeholder="Nhập tên banner" />}
          />
        </Form.Item>

        {/* Hình ảnh */}
        <Form.Item label="Hình ảnh" validateStatus={errors.imageUrl ? 'error' : ''} help={errors.imageUrl?.message}>
          <Controller
            name="imageUrl"
            control={control}
            rules={{ required: 'Vui lòng tải ảnh lên' }}
            render={({ field }) => (
              <>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    uploadImage([file]);
                    return false;
                  }}
                >
                  <button
                    type="button"
                    className="px-3 py-2 rounded-md border-2 hover:border-blue-400 hover:text-blue-500 text-sm flex items-center gap-2"
                  >
                    <FiUpload className="text-base" />
                    <span>Chọn ảnh</span>
                  </button>
                </Upload>
                {loading && <Spin className="ml-2" />}
                {image && <img src={image} alt="Preview" className="mt-2 w-[150px] h-auto rounded-md" />}
                <input type="hidden" {...field} />
              </>
            )}
          />
        </Form.Item>

        <Controller
          name="link"
          control={control}
          rules={{
            required: 'Không để trống link',
            pattern: {
              value: /^(https?:\/\/|\/)[\w.-]+.*$/i,
              message: 'Link không hợp lệ. VD: /products hoặc https://example.com',
            },
          }}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Link sự kiện"
              validateStatus={fieldState.error ? 'error' : ''}
              help={fieldState.error?.message}
            >
              <AutoComplete
                options={[
                  { value: '/product', label: 'Trang sản phẩm' },
                  { value: '/promotions', label: 'Trang khuyến mãi' },
                  { value: '/about', label: 'Trang giới thiệu' },
                ]}
                placeholder="Nhập link hoặc chọn gợi ý"
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                value={field.value}
                filterOption={(inputValue, option) => {
                  return (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase());
                }}

              />
            </Form.Item>
          )}
        />

        {/* Thời gian */}
        <div className="flex gap-4">
          <Form.Item
            label="Ngày bắt đầu"
            className="w-1/2"
            validateStatus={errors.startDate ? 'error' : ''}
            help={errors.startDate?.message}
          >
            <Controller
              name="startDate"
              control={control}
              rules={{ required: 'Chọn ngày bắt đầu' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                  onChange={(_, dateString) => field.onChange(dateString)}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Ngày kết thúc"
            className="w-1/2"
            validateStatus={errors.endDate ? 'error' : ''}
            help={errors.endDate?.message}
          >
            <Controller
              name="endDate"
              control={control}
              rules={{
                required: 'Chọn ngày kết thúc',
                validate: (value) => {
                  const startDate = getValues('startDate');
                  if (!startDate || !value) return true;
                  return (
                    dayjs(value, 'DD/MM/YYYY').isSameOrAfter(dayjs(startDate, 'DD/MM/YYYY')) ||
                    'Ngày kết thúc phải sau ngày bắt đầu'
                  );
                }
              }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format="DD/MM/YYYY"
                  className="w-full"
                  value={field.value ? dayjs(field.value, 'DD/MM/YYYY') : null}
                  onChange={(_, dateString) => field.onChange(dateString)}
                />
              )}
            />
          </Form.Item>
        </div>

        {/* Thứ tự hiển thị */}
        <Form.Item
          label="Thứ tự hiển thị"
          validateStatus={errors.order ? 'error' : ''}
          help={
            errors.order?.message ||
            (existingOrders.length > 0 && (
              <span>
                Thứ tự đã có: {existingOrders.sort((a:any, b:any) => a - b).join(', ')}
              </span>
            ))
          }
        >
          <Controller
            name="order"
            control={control}
            rules={{
              required: 'Không để trống thứ tự hiển thị',
              min: { value: 1, message: 'Thứ tự hiển thị phải lớn hơn 0' },
              validate: (value) =>
                !existingOrders.includes(Number(value)) ||
                'Thứ tự hiển thị đã tồn tại',
            }}
            render={({ field }) => (
              <Input {...field} type="number" />
            )}
          />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item
          label="Mô tả"
          validateStatus={errors.description ? 'error' : ''}
          help={errors.description?.message}
        >
          <Controller
            name="description"
            control={control}
            rules={{ required: 'Vui lòng nhập mô tả cho banner' }}
            render={({ field }) => (
              <Input.TextArea {...field} rows={3} placeholder="Nhập mô tả ngắn về banner..." />
            )}
          />
        </Form.Item>

        {/* Trạng thái */}
        <Form.Item label="Trạng thái">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                onChange={(val) => field.onChange(val)}
                checkedChildren="Hiển thị"
                unCheckedChildren="Ẩn"
              />
            )}
          />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={mutation.isPending}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-2 flex justify-right">
        <Tooltip title="Quay lại">
          <Button type="default" shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
        </Tooltip>
      </div>
    </div>
  );
};

export default BannerEdit;
