import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  message,
  Spin,
  Switch,
  Tooltip,
  Upload,
  Input,
  Form,
  AutoComplete
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { IBanner } from '../../../interface/banner';
import { addBanner, getAllBanners } from '../../../api/admin/banner';
import { useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { FiUpload } from 'react-icons/fi';
import { ArrowLeftOutlined } from '@ant-design/icons';

dayjs.extend(isSameOrAfter);

const { TextArea } = Input;

const BannerAdd = () => {
  const {
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
    getValues,
  } = useForm<IBanner>({
    mode: 'onChange',
  });

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

  const mutation = useMutation({
    mutationFn: async (data: IBanner) => {
      try {
        const response = await addBanner(data);
        return response.data;
      } catch (error) {
        message.error('Gửi banner thất bại, vui lòng thử lại!');
        throw error;
      }
    },
    onSuccess: () => {
      message.success('Thêm banner thành công');
      navigate('/admin/banner/list');
    },
    onError: () => {
      message.error('Gửi banner thất bại, vui lòng thử lại!');
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
    const formattedData = {
      ...data,
      status: data.status ?? false,
    };
    mutation.mutate(formattedData);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-lg border-2">
      <h2 className="text-3xl text-blue-500 font-bold mb-6 text-center">Thêm Banner</h2>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Tên banner */}
        <Controller
          name="name"
          control={control}
          rules={{ required: 'Không để trống tên banner' }}
          render={({ field }) => (
            <Form.Item
              label="Tên banner"
              validateStatus={errors.name ? 'error' : ''}
              help={errors.name?.message}
            >
              <Input {...field} placeholder="Nhập tên banner" />
            </Form.Item>
          )}
          
        />
        
        {/* Hình ảnh */}
        <Form.Item
          label="Hình ảnh"
          validateStatus={errors.imageUrl ? 'error' : ''}
          help={errors.imageUrl?.message}
        >
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
                  <Button icon={<FiUpload />}>Chọn ảnh</Button>
                </Upload>
                {loading && <Spin className="ml-2" />}
                {typeof image === 'string' && image && <img src={image} alt="Preview" className="mt-2 w-[150px] rounded" />}
                <input type="hidden" {...field} />
              </>
            )}
          />
        </Form.Item>

        {/* Link sự kiện */}
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
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu"
                value={field.value ? dayjs(field.value) : null}
                onChange={(date) => field.onChange(date ? date.toDate() : null)}
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
                    dayjs(value).isSameOrAfter(dayjs(startDate)) ||
                    'Ngày kết thúc phải sau ngày bắt đầu'
                  );
                }
              }}
              render={({ field }) => (
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toDate() : null)}
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

        {/* Mô tả banner */}
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
              <TextArea {...field} rows={3} placeholder="Nhập mô tả ngắn..." />
            )}
          />
        </Form.Item>

        {/* Trạng thái hiển thị */}
        <Form.Item label="Trạng thái hiển thị">
          <Controller
            name="status"
            control={control}
            defaultValue={true}
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

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={mutation.isPending}
          >
            Thêm banner
          </Button>
        </Form.Item>

        <div className="flex justify-end mt-2">
          <Tooltip title="Quay lại">
            <Button
              type="default"
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
          </Tooltip>
        </div>
      </Form>
    </div>
  );
};

export default BannerAdd;
