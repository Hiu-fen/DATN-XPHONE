import { useForm } from 'react-hook-form';
import { IContact } from '../../../interface/contact';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { message } from 'antd';

const Contact = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<IContact>()


    const mutation = useMutation({
        mutationFn: async (data: IContact) => {
            const res = await axios.post('http://localhost:5000/api/contacts', data)
            console.log(data);
            return res.data;
        },
        onSuccess: () =>{
            message.success('Gửi thành công')
            reset()
            
            
        },
         onError: () => {
              message.error('Gửi liên hệ thất bại, vui lòng thử lại!');
        }
    })

    const onSubmit = (data: IContact) =>{
        const contactData : IContact = {
            ...data,
            status: false,
            date: new Date().toLocaleDateString('en-GB'),
        }
        mutation.mutate(contactData);
        
        console.log(contactData)
    }




  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

      <div>
        <div className="bg-white rounded shadow p-6 mb-4">
          <h2 className="text-xl font-bold mb-2 text-red-600">Cửa hàng XPhone</h2>
          <p className="text-gray-700 text-sm mb-2">
            Hệ thống cửa hàng XPhone chuyên bán lẻ điện thoại, máy tính laptop, smartwatch, smartphone, phụ kiện chính hãng - Giá tốt, giao miễn phí.
          </p>
          <p className="mb-1"><span className="font-semibold">Địa chỉ:</span> Trịnh Văn Bô</p>
          <p className="mb-1"><span className="font-semibold">Hotline:</span> gọi cho hiếu</p>
          <p className="mb-1"><span className="font-semibold">Email:</span> trinhthiduong@gmail.com</p>
        </div>

        <div className="bg-gray-100 rounded shadow p-6">
          <h3 className="font-bold mb-3">Liên hệ</h3>
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-2">
              <input {...register('name',{required:'Tên không được để trống'})}            
              type="text" placeholder="Họ và tên" className="border rounded px-3 py-2 w-1/2" />
                <span className='text-red-500'>{errors.name?.message}</span>
              <input {...register('email',{required:"Email không được để trống"})}type="email" placeholder="Email" className="border rounded px-3 py-2 w-1/2" />
                <span className='text-red-500'>{errors.email?.message}</span>

            </div>
            <input {...register('phone',{required:'Số điện thoại không được để trống'})} type="text" placeholder="Số điện thoại" className="border rounded px-3 py-2 w-full" />
                <span className='text-red-500'>{errors.phone?.message}</span>
            <textarea {...register('message',{required:'Số điện thoại không được để trống'})}
             placeholder="Nội dung" className="border rounded px-3 py-2 w-full" rows={3}></textarea>

            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded w-full">Gửi liên hệ</button>
          </form>
        </div>
      </div>

      <div>
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8639311820666!2d105.74468687503176!3d21.03812978061353!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313455e940879933%3A0xcf10b34e9f1a03df!2zVHLGsOG7nW5nIENhbyDEkeG6s25nIEZQVCBQb2x5dGVjaG5pYw!5e0!3m2!1svi!2s!4v1747882891526!5m2!1svi!2s" 
        width="600" 
        height="550"
        loading="lazy"
></iframe>
        
      </div>
    </div>
  );
};

export default Contact;