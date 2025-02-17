import Image from "next/image";
import "./Author.css";

export default function Author({ name, avatarUrl }) {
  return (
    <div className="author">
      <div className="author-avatar">
        {avatarUrl ? (
          <Image src={avatarUrl} alt={name} fill className="object-cover" />
        ) : (
          <div className="author-avatar-placeholder">
            {name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      <span className="author-name">{name}</span>
    </div>
  );
}
